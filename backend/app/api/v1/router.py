"""
API v1 路由
"""

from fastapi import APIRouter

from app.api.v1.endpoints import templates, render, apikeys, dingtalk

api_router = APIRouter(prefix="/api/v1")

# 挂载各模块路由
api_router.include_router(templates.router)
api_router.include_router(render.router)
api_router.include_router(apikeys.router)
api_router.include_router(dingtalk.router)
