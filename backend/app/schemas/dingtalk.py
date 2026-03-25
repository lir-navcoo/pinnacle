"""
钉钉机器人 Schema
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class DingTalkBotBase(BaseModel):
    """钉钉机器人基础"""
    name: str = Field(..., min_length=1, max_length=100, description="机器人名称")
    webhook_url: str = Field(..., description="Webhook URL")
    secret: Optional[str] = Field(None, description="加签密钥")
    description: Optional[str] = Field(None, max_length=500, description="描述")


class DingTalkBotCreate(DingTalkBotBase):
    """创建钉钉机器人"""
    pass


class DingTalkBotUpdate(BaseModel):
    """更新钉钉机器人"""
    name: Optional[str] = None
    webhook_url: Optional[str] = None
    secret: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    default_conversation_id: Optional[str] = None


class DingTalkBotResponse(DingTalkBotBase):
    """钉钉机器人响应"""
    id: str
    user_id: str
    is_active: bool
    default_conversation_id: Optional[str] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DingTalkBotListResponse(BaseModel):
    """钉钉机器人列表响应"""
    items: List[DingTalkBotResponse]
    total: int


class DingTalkSendRequest(BaseModel):
    """钉钉发送请求"""
    bot_id: str = Field(..., description="机器人ID")
    message_type: str = Field("image", description="消息类型: text/image/markdown")
    content: str = Field(..., description="消息内容")
    conversation_id: Optional[str] = Field(None, description="会话ID")


class DingTalkSendResponse(BaseModel):
    """钉钉发送响应"""
    msg_id: str = Field(..., description="消息ID")
    errmsg: str = Field(..., description="错误消息")
    status: str = Field(..., description="发送状态")
