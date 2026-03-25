"""
渲染 API - 供三方系统调用
"""

import uuid
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import hashlib

from app.core.database import get_db
from app.models import Template, RenderJob, APIKey
from app.schemas import RenderRequest, RenderResponse, RenderJobResponse
from app.services import renderer_service, oss_service, dingtalk_service

router = APIRouter(prefix="/render", tags=["渲染接口"])


async def verify_api_key(
    x_api_key: str = Header(..., description="API Key"),
    db: AsyncSession = Depends(get_db),
) -> tuple[APIKey, str]:
    """
    验证 API Key
    
    Returns:
        (APIKey 实例, 原始 key)
    """
    # 计算 key 的 hash 来查找
    key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()
    
    result = await db.execute(
        select(APIKey).where(
            APIKey.key_hash == key_hash,
            APIKey.is_active == True
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=401, detail="无效的 API Key")
    
    # 检查过期
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API Key 已过期")
    
    # 更新使用统计
    api_key.call_count += 1
    api_key.last_used_at = datetime.utcnow()
    await db.commit()
    
    return api_key, x_api_key


@router.post("", response_model=RenderResponse)
async def render_image(
    request: RenderRequest,
    db: AsyncSession = Depends(get_db),
    api_key: APIKey = Depends(verify_api_key),
):
    """
    渲染战报图片（主要接口，供三方调用）
    
    支持功能：
    1. 根据模板和参数渲染图片
    2. 可选自动发送到钉钉
    """
    # 验证模板权限
    if api_key.template_ids and request.template_id not in api_key.template_ids:
        raise HTTPException(status_code=403, detail="无权访问此模板")
    
    # 获取模板
    result = await db.execute(
        select(Template).where(Template.id == request.template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    if template.status != "published" and not template.is_public:
        raise HTTPException(status_code=400, detail="模板未发布")
    
    # 创建渲染任务
    job_id = str(uuid.uuid4())
    job = RenderJob(
        id=job_id,
        template_id=request.template_id,
        api_key_id=api_key.id,
        user_id=api_key.user_id,
        params=request.params,
        format=request.format,
        quality=request.quality,
        status="pending",
    )
    
    if request.send_dingtalk:
        job.dingtalk_bot_id = request.dingtalk_bot_id
        job.dingtalk_conversation_id = request.dingtalk_conversation_id
    
    db.add(job)
    
    # 更新模板使用统计
    template.render_count += 1
    
    await db.commit()
    
    # 异步渲染（这里简化为同步执行，生产环境应使用后台任务队列）
    try:
        await process_render_job(job.id, template, request, db)
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        await db.commit()
    
    return RenderResponse(
        job_id=job.id,
        image_url=job.image_url,
        status=job.status,
        message=job.error_message if job.status == "failed" else "渲染成功"
    )


async def process_render_job(
    job_id: str,
    template: Template,
    request: RenderRequest,
    db: AsyncSession
):
    """处理渲染任务"""
    # 获取任务
    result = await db.execute(
        select(RenderJob).where(RenderJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    # 更新状态
    job.status = "processing"
    job.started_at = datetime.utcnow()
    await db.commit()
    
    try:
        # 准备模板数据
        template_data = {
            "width": template.width,
            "height": template.height,
            "background_color": template.background_color,
            "background_image": template.background_image,
            "elements": template.elements or [],
        }
        
        # 渲染图片
        image_bytes = await renderer_service.render(
            template=template_data,
            params=request.params,
            format=request.format,
            quality=request.quality
        )
        
        # 上传到 OSS
        image_url = await oss_service.upload_bytes(
            data=image_bytes,
            content_type=f"image/{request.format}",
            extension=request.format
        )
        
        if not image_url:
            raise Exception("图片上传失败")
        
        job.image_url = image_url
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        
        # 发送钉钉
        if request.send_dingtalk:
            await send_to_dingtalk(job, image_url, request, db)
        
        await db.commit()
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        await db.commit()
        raise


async def send_to_dingtalk(
    job: RenderJob,
    image_url: str,
    request: RenderRequest,
    db: AsyncSession
):
    """发送图片到钉钉"""
    if not request.send_dingtalk:
        return
    
    # 格式化消息
    title, content = dingtalk_service.format_battle_report(
        params=request.params,
        image_url=image_url,
        template_name="战报"
    )
    
    # 发送 Markdown 消息（钉钉机器人不支持直接发图片，用 Markdown 引用）
    result = await dingtalk_service.send_markdown(
        title=title,
        content=content
    )
    
    job.dingtalk_msg_id = result.get("msg_id")


@router.get("/job/{job_id}", response_model=RenderJobResponse)
async def get_render_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取渲染任务状态"""
    result = await db.execute(
        select(RenderJob).where(RenderJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return RenderJobResponse.model_validate(job)


@router.post("/preview", response_model=RenderResponse)
async def preview_render(
    template_id: str,
    params: dict = Query(default_factory=dict),
    format: str = Query("png"),
    quality: int = Query(95),
    db: AsyncSession = Depends(get_db),
    api_key: APIKey = Depends(verify_api_key),
):
    """
    预览渲染（不保存任务记录）
    直接返回图片数据，用于编辑器预览
    """
    # 获取模板
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 准备模板数据
    template_data = {
        "width": template.width,
        "height": template.height,
        "background_color": template.background_color,
        "background_image": template.background_image,
        "elements": template.elements or [],
    }
    
    # 渲染图片
    image_bytes = await renderer_service.render(
        template=template_data,
        params=params,
        format=format,
        quality=quality
    )
    
    # 直接返回（FastAPI 可以返回 bytes）
    from fastapi.responses import Response
    return Response(
        content=image_bytes,
        media_type=f"image/{format}",
        headers={"Content-Disposition": f"inline; filename=preview.{format}"}
    )
