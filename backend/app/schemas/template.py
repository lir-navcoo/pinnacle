"""
模板 Schema
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.element import ElementResponse


class TemplateBase(BaseModel):
    """模板基础Schema"""
    name: str = Field(..., min_length=1, max_length=100, description="模板名称")
    description: Optional[str] = Field(None, max_length=500, description="模板描述")
    width: int = Field(750, ge=100, le=4000, description="画布宽度")
    height: int = Field(1334, ge=100, le=4000, description="画布高度")
    background_color: str = Field("#ffffff", description="背景颜色")
    background_image: Optional[str] = Field(None, description="背景图片URL")
    is_public: bool = Field(False, description="是否公开")


class TemplateCreate(TemplateBase):
    """创建模板"""
    elements: List[Dict[str, Any]] = Field(default_factory=list, description="元素列表")


class TemplateUpdate(BaseModel):
    """更新模板"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    width: Optional[int] = Field(None, ge=100, le=4000)
    height: Optional[int] = Field(None, ge=100, le=4000)
    background_color: Optional[str] = None
    background_image: Optional[str] = None
    is_public: Optional[bool] = None
    elements: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None


class TemplateResponse(TemplateBase):
    """模板响应"""
    id: str
    user_id: str
    status: str = Field("draft", description="状态: draft/published/archived")
    elements: List[ElementResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    """模板列表响应"""
    items: List[TemplateResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TemplateSimple(BaseModel):
    """模板简化信息"""
    id: str
    name: str
    thumbnail: Optional[str] = None
    status: str
    updated_at: datetime
    
    class Config:
        from_attributes = True
