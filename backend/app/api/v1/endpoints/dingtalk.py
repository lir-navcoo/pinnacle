"""
钉钉机器人管理 API
"""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import DingTalkBot, DingTalkMessage
from app.schemas import (
    DingTalkBotCreate,
    DingTalkBotUpdate,
    DingTalkBotResponse,
    DingTalkBotListResponse,
    DingTalkSendRequest,
    DingTalkSendResponse,
)
from app.services import dingtalk_service

router = APIRouter(prefix="/dingtalk", tags=["钉钉机器人"])


async def get_current_user_id(
    authorization: Optional[str] = None
) -> str:
    """获取当前用户ID"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        payload = decode_access_token(token)
        if payload:
            return payload.get("sub", "anonymous")
    return "anonymous"


@router.get("/bots", response_model=DingTalkBotListResponse)
async def list_dingtalk_bots(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取钉钉机器人列表"""
    query = select(DingTalkBot).where(DingTalkBot.user_id == user_id)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    offset = (page - 1) * page_size
    query = query.order_by(DingTalkBot.created_at.desc()).offset(offset).limit(page_size)
    
    result = await db.execute(query)
    bots = result.scalars().all()
    
    return DingTalkBotListResponse(
        items=[DingTalkBotResponse.model_validate(b) for b in bots],
        total=total,
    )


@router.post("/bots", response_model=DingTalkBotResponse, status_code=201)
async def create_dingtalk_bot(
    data: DingTalkBotCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """创建钉钉机器人"""
    bot = DingTalkBot(
        name=data.name,
        webhook_url=data.webhook_url,
        secret=data.secret,
        description=data.description,
        user_id=user_id,
    )
    
    db.add(bot)
    await db.commit()
    await db.refresh(bot)
    
    return DingTalkBotResponse.model_validate(bot)


@router.get("/bots/{bot_id}", response_model=DingTalkBotResponse)
async def get_dingtalk_bot(
    bot_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """获取钉钉机器人详情"""
    result = await db.execute(
        select(DingTalkBot).where(
            DingTalkBot.id == bot_id,
            DingTalkBot.user_id == user_id
        )
    )
    bot = result.scalar_one_or_none()
    
    if not bot:
        raise HTTPException(status_code=404, detail="机器人不存在")
    
    return DingTalkBotResponse.model_validate(bot)


@router.put("/bots/{bot_id}", response_model=DingTalkBotResponse)
async def update_dingtalk_bot(
    bot_id: str,
    data: DingTalkBotUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """更新钉钉机器人"""
    result = await db.execute(
        select(DingTalkBot).where(
            DingTalkBot.id == bot_id,
            DingTalkBot.user_id == user_id
        )
    )
    bot = result.scalar_one_or_none()
    
    if not bot:
        raise HTTPException(status_code=404, detail="机器人不存在")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bot, field, value)
    
    await db.commit()
    await db.refresh(bot)
    
    return DingTalkBotResponse.model_validate(bot)


@router.delete("/bots/{bot_id}")
async def delete_dingtalk_bot(
    bot_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """删除钉钉机器人"""
    result = await db.execute(
        select(DingTalkBot).where(
            DingTalkBot.id == bot_id,
            DingTalkBot.user_id == user_id
        )
    )
    bot = result.scalar_one_or_none()
    
    if not bot:
        raise HTTPException(status_code=404, detail="机器人不存在")
    
    await db.delete(bot)
    await db.commit()
    
    return {"message": "机器人已删除"}


@router.post("/bots/{bot_id}/test", response_model=DingTalkSendResponse)
async def test_dingtalk_bot(
    bot_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """测试钉钉机器人"""
    result = await db.execute(
        select(DingTalkBot).where(
            DingTalkBot.id == bot_id,
            DingTalkBot.user_id == user_id
        )
    )
    bot = result.scalar_one_or_none()
    
    if not bot:
        raise HTTPException(status_code=404, detail="机器人不存在")
    
    # 发送测试消息
    response = await dingtalk_service.send_text(
        content="🔔 这是一条来自 Pinnacle 战报平台的测试消息",
        webhook_url=bot.webhook_url,
        secret=bot.secret
    )
    
    return DingTalkSendResponse(
        msg_id=response.get("msg_id", ""),
        errmsg=response.get("errmsg", ""),
        status="success" if response.get("errcode") == 0 else "failed"
    )


@router.post("/send", response_model=DingTalkSendResponse)
async def send_dingtalk_message(
    request: DingTalkSendRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """发送钉钉消息"""
    # 获取机器人
    result = await db.execute(
        select(DingTalkBot).where(
            DingTalkBot.id == request.bot_id,
            DingTalkBot.user_id == user_id
        )
    )
    bot = result.scalar_one_or_none()
    
    if not bot:
        raise HTTPException(status_code=404, detail="机器人不存在")
    
    if not bot.is_active:
        raise HTTPException(status_code=400, detail="机器人未启用")
    
    # 记录消息
    message = DingTalkMessage(
        bot_id=bot.id,
        message_type=request.message_type,
        content={"text": request.content},
        conversation_id=request.conversation_id,
        status="pending",
    )
    db.add(message)
    
    # 更新机器人使用统计
    bot.send_count += 1
    
    # 发送消息
    if request.message_type == "text":
        response = await dingtalk_service.send_text(
            content=request.content,
            webhook_url=bot.webhook_url,
            secret=bot.secret
        )
    elif request.message_type == "image":
        response = await dingtalk_service.send_image(
            image_url=request.content,
            webhook_url=bot.webhook_url,
            secret=bot.secret
        )
    elif request.message_type == "markdown":
        response = await dingtalk_service.send_markdown(
            title="战报",
            content=request.content,
            webhook_url=bot.webhook_url,
            secret=bot.secret
        )
    else:
        raise HTTPException(status_code=400, detail="不支持的消息类型")
    
    # 更新状态
    if response.get("errcode") == 0:
        message.status = "sent"
        message.msg_id = response.get("msg_id")
        message.sent_at = datetime.utcnow()
        bot.success_count += 1
        bot.last_used_at = datetime.utcnow()
    else:
        message.status = "failed"
        message.error_code = str(response.get("errcode"))
        message.error_message = response.get("errmsg")
    
    await db.commit()
    
    return DingTalkSendResponse(
        msg_id=message.msg_id or "",
        errmsg=response.get("errmsg", ""),
        status=message.status
    )
