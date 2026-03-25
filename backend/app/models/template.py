"""
模板数据模型
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
import uuid


class Template(Base):
    """模板模型"""
    __tablename__ = "templates"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    width: Mapped[int] = mapped_column(Integer, default=750)
    height: Mapped[int] = mapped_column(Integer, default=1334)
    background_color: Mapped[str] = mapped_column(String(20), default="#ffffff")
    background_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    elements: Mapped[List[dict]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 统计
    render_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # 关联
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    
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
        return f"<Template(id={self.id}, name={self.name})>"


class RenderJob(Base):
    """渲染任务模型"""
    __tablename__ = "render_jobs"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    template_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("templates.id"), 
        nullable=False,
        index=True
    )
    api_key_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    
    # 请求参数
    params: Mapped[dict] = mapped_column(JSON, default=dict)
    format: Mapped[str] = mapped_column(String(10), default="png")
    quality: Mapped[int] = mapped_column(Integer, default=95)
    
    # 结果
    status: Mapped[str] = mapped_column(
        String(20), 
        default="pending",
        index=True
    )
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 钉钉发送
    dingtalk_bot_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    dingtalk_msg_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    dingtalk_conversation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        index=True
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<RenderJob(id={self.id}, status={self.status})>"
