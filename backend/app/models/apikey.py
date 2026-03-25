"""
API Key 数据模型
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
import uuid
import hashlib
import secrets

from app.core.database import Base


def generate_api_key() -> tuple[str, str, str]:
    """生成 API Key
    返回: (完整key, hash, prefix)
    """
    prefix = "pkl_" + secrets.token_hex(4)
    random_part = secrets.token_hex(24)
    full_key = f"{prefix}_{random_part}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    return full_key, key_hash, prefix


class APIKey(Base):
    """API Key 模型"""
    __tablename__ = "api_keys"
    
    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    prefix: Mapped[str] = mapped_column(String(20), nullable=False)
    
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    
    permissions: Mapped[List[str]] = mapped_column(JSON, default=list)
    rate_limit: Mapped[int] = mapped_column(Integer, default=100)  # 每分钟
    template_ids: Mapped[List[str]] = mapped_column(JSON, default=list)  # 可访问的模板
    allowed_ips: Mapped[List[str]] = mapped_column(JSON, default=list)  # 允许的IP
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # 使用统计
    call_count: Mapped[int] = mapped_column(Integer, default=0)
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
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<APIKey(id={self.id}, name={self.name}, prefix={self.prefix})>"
    
    @classmethod
    def create_with_key(cls, name: str, user_id: str, **kwargs) -> tuple["APIKey", str]:
        """创建 API Key，返回 (实例, 完整key)
        
        注意：完整key只在此方法返回一次，之后无法找回
        """
        full_key, key_hash, prefix = generate_api_key()
        instance = cls(
            name=name,
            key_hash=key_hash,
            prefix=prefix,
            user_id=user_id,
            **kwargs
        )
        return instance, full_key
    
    def verify_key(self, key: str) -> bool:
        """验证 API Key"""
        return self.key_hash == hashlib.sha256(key.encode()).hexdigest()
