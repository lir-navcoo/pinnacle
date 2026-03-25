"""
阿里云 OSS 服务
"""

import uuid
from datetime import datetime
from typing import Optional, BinaryIO

import httpx

from app.core.config import settings


class OSSService:
    """阿里云 OSS 服务"""
    
    def __init__(self):
        self.endpoint = settings.OSS_ENDPOINT
        self.bucket_name = settings.OSS_BUCKET_NAME
        self.region = settings.OSS_REGION
        self.access_key_id = settings.OSS_ACCESS_KEY_ID
        self.access_key_secret = settings.OSS_ACCESS_KEY_SECRET
    
    def _get_upload_url(self, object_name: str) -> tuple[str, str]:
        """
        获取上传地址和公开访问URL
        
        Returns:
            (upload_url, public_url)
        """
        # 公开访问URL
        public_url = f"https://{self.bucket_name}.{self.endpoint.replace('https://', '')}/{object_name}"
        return public_url
    
    def generate_object_name(
        self,
        prefix: str = "pinnacle",
        extension: str = "png"
    ) -> str:
        """生成 OSS 对象名"""
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
        上传字节数据到 OSS
        
        Returns:
            公开访问 URL
        """
        if not self.access_key_id or not self.access_key_secret:
            # 如果没有配置 OSS，使用本地存储模拟
            return await self._save_local(data, extension)
        
        if object_name is None:
            object_name = self.generate_object_name(extension=extension)
        
        public_url = self._get_upload_url(object_name)
        
        # 使用 PUT 请求上传
        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    public_url,
                    content=data,
                    headers={
                        "Content-Type": content_type,
                        "x-oss-object-acl": "public-read"
                    },
                    timeout=30
                )
                
                if response.status_code in (200, 201):
                    return public_url
                else:
                    print(f"OSS upload failed: {response.status_code} {response.text}")
                    return None
        except Exception as e:
            print(f"OSS upload error: {e}")
            return None
    
    async def upload_file(
        self,
        file_path: str,
        object_name: Optional[str] = None,
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """上传本地文件到 OSS"""
        with open(file_path, "rb") as f:
            data = f.read()
        
        if content_type is None:
            ext = file_path.split(".")[-1].lower()
            content_type = {
                "png": "image/png",
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "gif": "image/gif",
                "webp": "image/webp",
            }.get(ext, "application/octet-stream")
        
        return await self.upload_bytes(data, object_name, content_type, ext)
    
    async def _save_local(
        self,
        data: bytes,
        extension: str
    ) -> Optional[str]:
        """本地存储（无 OSS 配置时使用）"""
        import os
        object_name = self.generate_object_name(extension=extension)
        local_dir = "/Users/lirui/Documents/pinnacle/backend/uploads"
        
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, object_name.replace("/", "_"))
        
        with open(local_path, "wb") as f:
            f.write(data)
        
        # 返回相对路径
        return f"/uploads/{object_name.replace('/', '_')}"
    
    async def delete(self, object_name: str) -> bool:
        """删除 OSS 对象"""
        if not self.access_key_id or not self.access_key_secret:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                url = self._get_upload_url(object_name)
                response = await client.delete(url, timeout=10)
                return response.status_code in (200, 204)
        except Exception:
            return False
    
    def get_public_url(self, object_name: str) -> str:
        """获取公开访问 URL"""
        return self._get_upload_url(object_name)


# 全局单例
oss_service = OSSService()
