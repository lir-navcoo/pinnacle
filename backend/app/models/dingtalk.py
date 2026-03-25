"""
钉钉机器人数据模型
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
import uuid

from app.core.database import Base


class DingTalkBot(Base):
    """钉钉机器人模型"""
    __tablename__ = "dingtalk_bots"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    webhook_url: Mapped[str] = mapped_column(Text, nullable=False)
    secret: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    default_conversation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # 使用统计
    send_count: Mapped[int] = mapped_column(Integer, default=0)
    success_count: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    def __repr__(self):
        return f"<DingTalkBot(id={self.id}, name={self.name})>"


class DingTalkMessage(Base):
    """钉钉消息记录"""
    __tablename__ = "dingtalk_messages"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    bot_id: Mapped[str] = mapped_column(
        String(36), 
        nullable=False, 
        index=True
    )
    msg_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    conversation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    message_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[dict] = mapped_column(JSON, default=dict)
    
    status: Mapped[str] = mapped_column(String(20), default="pending")
    error_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    render_job_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<DingTalkMessage(id={self.id}, status={self.status})>"
