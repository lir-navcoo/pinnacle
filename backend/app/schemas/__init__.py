"""Schemas 模块 - Pydantic 数据模型"""

from app.schemas.element import (
    ElementBase,
    TextElement,
    ImageElement,
    ShapeElement,
    ChartElement,
    ElementCreate,
    ElementUpdate,
    ElementResponse,
)
from app.schemas.template import (
    TemplateBase,
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplateListResponse,
    TemplateSimple,
)
from app.schemas.render import (
    RenderRequest,
    RenderResponse,
    RenderJobResponse,
)
from app.schemas.apikey import (
    APIKeyBase,
    APIKeyCreate,
    APIKeyUpdate,
    APIKeyResponse,
    APIKeyListResponse,
)
from app.schemas.dingtalk import (
    DingTalkBotBase,
    DingTalkBotCreate,
    DingTalkBotUpdate,
    DingTalkBotResponse,
    DingTalkBotListResponse,
    DingTalkSendRequest,
    DingTalkSendResponse,
)

__all__ = [
    # Element
    "ElementBase",
    "TextElement",
    "ImageElement",
    "ShapeElement",
    "ChartElement",
    "ElementCreate",
    "ElementUpdate",
    "ElementResponse",
    # Template
    "TemplateBase",
    "TemplateCreate",
    "TemplateUpdate",
    "TemplateResponse",
    "TemplateListResponse",
    "TemplateSimple",
    # Render
    "RenderRequest",
    "RenderResponse",
    "RenderJobResponse",
    # API Key
    "APIKeyBase",
    "APIKeyCreate",
    "APIKeyUpdate",
    "APIKeyResponse",
    "APIKeyListResponse",
    # DingTalk
    "DingTalkBotBase",
    "DingTalkBotCreate",
    "DingTalkBotUpdate",
    "DingTalkBotResponse",
    "DingTalkBotListResponse",
    "DingTalkSendRequest",
    "DingTalkSendResponse",
]
