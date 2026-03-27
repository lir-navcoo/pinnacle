"""
文件存储服务（支持本地存储和阿里云 OSS）
"""

import uuid
from datetime import datetime
from typing import Optional

from app.core.config import settings
from app.services.storage_service import local_storage


class StorageService:
    """文件存储服务（自动切换本地/OSS）"""
    
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        
        if self.storage_type == "oss":
            self.endpoint = settings.OSS_ENDPOINT
            self.bucket_name = settings.OSS_BUCKET_NAME
            self.access_key_id = settings.OSS_ACCESS_KEY_ID
            self.access_key_secret = settings.OSS_ACCESS_KEY_SECRET
    
    def generate_object_name(
        self,
        prefix: str = "pinnacle",
        extension: str = "png"
    ) -> str:
        """生成对象名"""
        now = datetime.utcnow()
        unique_id = uuid.uuid4().hex[:8]
        date_path = now.strftime("%Y/%m/%d")
        filename = f"{now.strftime('%H%M%S')}_{unique_id}.{extension}"
        return f"{prefix}/{date_path}/{filename}"
    
    async def upload_bytes(
        self,
        data: bytes,
        object_name: Optional[str] = None,
        content_type: str = "image/png",
        extension: str = "png"
    ) -> Optional[str]:
        """
        上传字节数据
        
        Returns:
            访问 URL
        """
        # 根据配置选择存储方式
        if self.storage_type == "local":
            return await local_storage.save_bytes(data, object_name, content_type, extension)
        else:
            # TODO: 实现 OSS 上传逻辑
            print("⚠️  OSS 模式尚未实现，使用本地存储")
            return await local_storage.save_bytes(data, object_name, content_type, extension)
    
    async def upload_file(
        self,
        file_path: str,
        object_name: Optional[str] = None,
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """上传本地文件"""
        if self.storage_type == "local":
            return await local_storage.save_file(file_path, object_name)
        else:
            print("⚠️  OSS 模式尚未实现，使用本地存储")
            return await local_storage.save_file(file_path, object_name)
    
    async def delete(self, relative_url: str) -> bool:
        """删除文件"""
        if self.storage_type == "local":
            return await local_storage.delete(relative_url)
        else:
            return False
    
    def get_public_url(self, object_name: str) -> str:
        """获取公开访问 URL"""
        if self.storage_type == "local":
            return f"{settings.LOCAL_STORAGE_URL_PREFIX}/{object_name}"
        else:
            return f"https://{self.bucket_name}.{self.endpoint.replace('https://', '')}/{object_name}"


# 全局单例
storage_service = StorageService()
