"""
渲染 Schema
"""

from typing import Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class RenderRequest(BaseModel):
    """渲染请求"""
    template_id: str = Field(..., description="模板ID")
    params: Dict[str, Any] = Field(default_factory=dict, description="渲染参数")
    format: Literal["png", "jpeg", "jpg"] = Field("png", description="输出格式")
    quality: int = Field(95, ge=1, le=100, description="图片质量")
    send_dingtalk: bool = Field(False, description="是否发送钉钉")
    dingtalk_bot_id: Optional[str] = Field(None, description="钉钉机器人ID")
    dingtalk_conversation_id: Optional[str] = Field(None, description="钉钉会话ID")


class RenderResponse(BaseModel):
    """渲染响应"""
    job_id: str = Field(..., description="任务ID")
    image_url: Optional[str] = Field(None, description="生成的图片URL")
    status: Literal["pending", "processing", "completed", "failed"] = Field(..., description="任务状态")
    message: Optional[str] = Field(None, description="状态消息")


class RenderJobResponse(BaseModel):
    """渲染任务详情响应"""
    id: str
    template_id: str
    params: Dict[str, Any]
    status: str
    image_url: Optional[str] = None
    dingtalk_msg_id: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
