"""
Pinnacle 战报配置平台 - FastAPI 主应用
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # 初始化数据库
    await init_db()
    print("✅ Database initialized")
    
    # 确保上传目录存在
    uploads_dir = "/Users/lirui/Documents/pinnacle/backend/uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    
    yield
    
    # 关闭时
    print("👋 Shutting down...")


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## Pinnacle 战报配置平台 API
    
    核心功能：
    - 🎨 **模板管理**：创建、编辑、发布战报图片模板
    - 📡 **渲染接口**：三方系统调用，传入参数生成战报图片
    - 📤 **钉钉推送**：自动发送战报到钉钉群
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件（用于本地开发时访问上传的图片）
uploads_dir = "/Users/lirui/Documents/pinnacle/backend/uploads"
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# 注册 API 路由
app.include_router(api_router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
