"""
本地文件存储服务
"""

import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from app.core.config import settings


class LocalStorageService:
    """本地文件存储服务"""
    
    def __init__(self):
        self.storage_path = Path(settings.LOCAL_STORAGE_PATH)
        self.url_prefix = settings.LOCAL_STORAGE_URL_PREFIX
        
        # 确保存储目录存在
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    def generate_filename(
        self,
        prefix: str = "pinnacle",
        extension: str = "png"
    ) -> str:
        """生成文件名（按日期分层）"""
        now = datetime.utcnow()
        unique_id = uuid.uuid4().hex[:8]
        date_path = now.strftime("%Y/%m/%d")
        filename = f"{now.strftime('%H%M%S')}_{unique_id}.{extension}"
        return f"{prefix}/{date_path}/{filename}"
    
    async def save_bytes(
        self,
        data: bytes,
        filename: Optional[str] = None,
        content_type: str = "image/png",
        extension: str = "png"
    ) -> str:
        """
        保存字节数据到本地
        
        Returns:
            访问 URL（相对路径）
        """
        if filename is None:
            filename = self.generate_filename(extension=extension)
        
        # 创建目录
        file_path = self.storage_path / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 写入文件
        with open(file_path, "wb") as f:
            f.write(data)
        
        # 返回访问 URL
        return f"{self.url_prefix}/{filename}"
    
    async def save_file(
        self,
        source_path: str,
        filename: Optional[str] = None
    ) -> str:
        """
        保存本地文件
        
        Returns:
            访问 URL
        """
        # 获取扩展名
        ext = Path(source_path).suffix.lstrip(".") or "bin"
        
        if filename is None:
            filename = self.generate_filename(extension=ext)
        
        # 目标路径
        dest_path = self.storage_path / filename
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 复制文件
        shutil.copy2(source_path, dest_path)
        
        # 返回访问 URL
        return f"{self.url_prefix}/{filename}"
    
    async def delete(self, relative_url: str) -> bool:
        """
        删除文件
        
        Args:
            relative_url: 相对 URL（如 /uploads/pinnacle/2024/01/15/xxx.png）
        
        Returns:
            是否成功删除
        """
        try:
            # 转换为本地路径
            file_path = self.storage_path / relative_url.lstrip(self.url_prefix + "/")
            
            if file_path.exists():
                file_path.unlink()
                return True
            
            return False
        except Exception as e:
            print(f"删除文件失败：{e}")
            return False
    
    def get_absolute_path(self, relative_url: str) -> Path:
        """获取文件的绝对路径"""
        return self.storage_path / relative_url.lstrip(self.url_prefix + "/")
    
    def file_exists(self, relative_url: str) -> bool:
        """检查文件是否存在"""
        file_path = self.get_absolute_path(relative_url)
        return file_path.exists()


# 全局单例
local_storage = LocalStorageService()
