"""
API Key Schema
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class APIKeyBase(BaseModel):
    """API Key 基础"""
    name: str = Field(..., min_length=1, max_length=100, description="名称")
    permissions: List[str] = Field(default_factory=list, description="权限列表")
    rate_limit: int = Field(100, ge=1, description="每分钟请求限制")
    template_ids: List[str] = Field(default_factory=list, description="可访问的模板ID列表")


class APIKeyCreate(APIKeyBase):
    """创建 API Key"""
    pass


class APIKeyUpdate(BaseModel):
    """更新 API Key"""
    name: Optional[str] = None
    permissions: Optional[List[str]] = None
    rate_limit: Optional[int] = None
    template_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None


class APIKeyResponse(APIKeyBase):
    """API Key 响应"""
    id: str
    key: str = Field(..., description="API Key（仅创建时返回完整）")
    prefix: str = Field(..., description="Key 前缀")
    user_id: str
    is_active: bool
    last_used_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class APIKeyListResponse(BaseModel):
    """API Key 列表响应"""
    items: List[APIKeyResponse]
    total: int
