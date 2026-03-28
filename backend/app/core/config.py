"""
应用配置
"""

import os
from typing import List
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    
    # 项目信息
    APP_NAME: str = "Pinnacle"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # 服务器
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 数据库（MySQL）
    DATABASE_URL: str = "sqlite+aiosqlite:///pinnacle.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 本地文件存储配置
    STORAGE_TYPE: str = "local"  # local | oss
    LOCAL_STORAGE_PATH: str = "/Users/lirui/Documents/pinnacle/backend/uploads"
    LOCAL_STORAGE_URL_PREFIX: str = "/uploads"
    
    # 阿里云 OSS（保留，可选切换）
    OSS_ENDPOINT: str = "https://oss-cn-hangzhou.aliyuncs.com"
    OSS_ACCESS_KEY_ID: str = ""
    OSS_ACCESS_KEY_SECRET: str = ""
    OSS_BUCKET_NAME: str = "pinnacle"
    OSS_REGION: str = "cn-hangzhou"
    
    # 钉钉
    DINGTALK_WEBHOOK_URL: str = ""
    DINGTALK_SECRET: str = ""
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # 渲染配置
    RENDER_CACHE_TTL: int = 3600  # 渲染缓存 TTL（秒）
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    DEFAULT_IMAGE_FORMAT: str = "PNG"
    DEFAULT_IMAGE_QUALITY: int = 95
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
