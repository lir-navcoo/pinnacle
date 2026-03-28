"""
模板管理 API
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import Template
from app.schemas import (
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplateListResponse,
)
from app.services import renderer_service

router = APIRouter(prefix="/templates", tags=["模板管理"])


async def get_current_user_id(
    authorization: Optional[str] = None
) -> str:
    """获取当前用户ID（简化版，实际应该验证Token）"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        payload = decode_access_token(token)
        if payload:
            return payload.get("sub", "anonymous")
    return "anonymous"


@router.get("", response_model=TemplateListResponse)
async def list_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取模板列表"""
    # 构建查询
    query = select(Template).where(Template.user_id == user_id)
    
    if status:
        query = query.where(Template.status == status)
    
    if search:
        # SQLite 使用 like (不区分大小写)
        query = query.where(Template.name.like(f"%{search}%"))
    
    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    offset = (page - 1) * page_size
    query = query.order_by(Template.updated_at.desc()).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return TemplateListResponse(
        items=[TemplateResponse.model_validate(t) for t in templates],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size if total > 0 else 0,
    )


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取单个模板"""
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    return TemplateResponse.model_validate(template)


@router.post("", response_model=TemplateResponse, status_code=201)
async def create_template(
    template_data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """创建模板"""
    template = Template(
        name=template_data.name,
        description=template_data.description,
        width=template_data.width,
        height=template_data.height,
        background_color=template_data.background_color,
        background_image=template_data.background_image,
        is_public=template_data.is_public,
        elements=template_data.elements,
        user_id=user_id,
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    return TemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    template_data: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新模板"""
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 更新字段
    update_data = template_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    await db.commit()
    await db.refresh(template)
    
    return TemplateResponse.model_validate(template)


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
):
    """删除模板"""
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    await db.delete(template)
    await db.commit()
    
    return {"message": "模板已删除"}


@router.post("/{template_id}/publish", response_model=TemplateResponse)
async def publish_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
):
    """发布模板"""
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    template.status = "published"
    await db.commit()
    await db.refresh(template)
    
    return TemplateResponse.model_validate(template)


@router.post("/{template_id}/duplicate", response_model=TemplateResponse)
async def duplicate_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """复制模板"""
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    source = result.scalar_one_or_none()
    
    if not source:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 创建副本
    new_template = Template(
        name=f"{source.name} (副本)",
        description=source.description,
        width=source.width,
        height=source.height,
        background_color=source.background_color,
        background_image=source.background_image,
        elements=source.elements,
        user_id=user_id,
    )
    
    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)
    
    return TemplateResponse.model_validate(new_template)


@router.post("/{template_id}/thumbnail")
async def generate_thumbnail(
    template_id: str,
    db: AsyncSession = Depends(get_db),
):
    """生成模板缩略图"""
    result = await db.execute(
        select(Template).where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 将 SQLAlchemy 模型转换为字典
    template_dict = {
        "width": template.width,
        "height": template.height,
        "background_color": template.background_color,
        "background_image": template.background_image,
        "elements": template.elements or [],
    }
    
    # 生成缩略图
    thumbnail_data = renderer_service.generate_thumbnail(template_dict)
    
    # 保存缩略图
    from app.services import storage_service
    thumbnail_url = await storage_service.upload_bytes(
        thumbnail_data,
        content_type="image/png",
        extension="png"
    )
    
    if thumbnail_url:
        template.thumbnail = thumbnail_url
        await db.commit()
    
    return {"thumbnail_url": thumbnail_url}
