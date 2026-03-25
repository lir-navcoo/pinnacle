"""
模板元素 Schema
"""

from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class ElementBase(BaseModel):
    """元素基础Schema"""
    type: Literal["text", "image", "shape", "chart"] = Field(..., description="元素类型")
    name: str = Field(..., description="元素名称")
    x: float = Field(0, description="X坐标")
    y: float = Field(0, description="Y坐标")
    width: float = Field(100, description="宽度")
    height: float = Field(50, description="高度")
    rotation: float = Field(0, description="旋转角度")
    z_index: int = Field(0, description="图层顺序")
    opacity: float = Field(1.0, ge=0, le=1, description="透明度")
    lock: bool = Field(False, description="是否锁定")
    visible: bool = Field(True, description="是否可见")


class TextElement(ElementBase):
    """文本元素"""
    type: Literal["text"] = "text"
    content: str = Field("", description="文本内容")
    font_family: str = Field("sans-serif", description="字体")
    font_size: float = Field(24, description="字号")
    font_weight: str = Field("normal", description="字重")
    font_color: str = Field("#000000", description="字体颜色")
    text_align: Literal["left", "center", "right"] = Field("left", description="文本对齐")
    line_height: float = Field(1.5, description="行高")
    binding_field: Optional[str] = Field(None, description="绑定字段（用于模板变量）")


class ImageElement(ElementBase):
    """图片元素"""
    type: Literal["image"] = "image"
    src: str = Field("", description="图片地址")
    border_radius: float = Field(0, description="圆角")
    border_width: float = Field(0, description="边框宽度")
    border_color: str = Field("#000000", description="边框颜色")
    object_fit: Literal["cover", "contain", "fill"] = Field("cover", description="填充方式")


class ShapeElement(ElementBase):
    """形状元素"""
    type: Literal["shape"] = "shape"
    shape_type: Literal["rect", "circle", "line"] = Field("rect", description="形状类型")
    fill_color: str = Field("#ffffff", description="填充颜色")
    stroke_color: str = Field("#000000", description="边框颜色")
    stroke_width: float = Field(1, description="边框宽度")


class ChartElement(ElementBase):
    """图表元素"""
    type: Literal["chart"] = "chart"
    chart_type: Literal["bar", "pie", "progress"] = Field("bar", description="图表类型")
    data: list = Field(default_factory=list, description="图表数据")
    colors: list = Field(default_factory=list, description="配色方案")


class ElementCreate(TextElement):
    """创建元素"""
    pass


class ElementUpdate(BaseModel):
    """更新元素"""
    type: Optional[Literal["text", "image", "shape", "chart"]] = None
    name: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    rotation: Optional[float] = None
    z_index: Optional[int] = None
    opacity: Optional[float] = None
    lock: Optional[bool] = None
    visible: Optional[bool] = None
    # 文本属性
    content: Optional[str] = None
    font_family: Optional[str] = None
    font_size: Optional[float] = None
    font_weight: Optional[str] = None
    font_color: Optional[str] = None
    text_align: Optional[Literal["left", "center", "right"]] = None
    line_height: Optional[float] = None
    binding_field: Optional[str] = None
    # 图片属性
    src: Optional[str] = None
    border_radius: Optional[float] = None
    # 图表属性
    data: Optional[list] = None


class ElementResponse(TextElement):
    """元素响应"""
    id: str
    
    class Config:
        from_attributes = True
