"""
钉钉服务
"""

import time
import hashlib
import hmac
import base64
from typing import Optional, Dict, Any
from datetime import datetime

import httpx

from app.core.config import settings


class DingTalkService:
    """钉钉机器人服务"""
    
    def __init__(self):
        self.webhook_url = settings.DINGTALK_WEBHOOK_URL
        self.secret = settings.DINGTALK_SECRET
    
    def _generate_sign(self, secret: str) -> str:
        """生成签名"""
        timestamp = str(round(time.time() * 1000))
        secret_enc = secret.encode("utf-8")
        string_to_sign = f"{timestamp}\n{secret}"
        string_to_sign_enc = string_to_sign.encode("utf-8")
        hmac_code = hmac.new(secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
        sign = base64.b64encode(hmac_code).decode("utf-8")
        return timestamp, sign
    
    def _get_webhook_url_with_sign(self, webhook_url: str, secret: Optional[str] = None) -> str:
        """获取带签名的 Webhook URL"""
        if not secret:
            secret = self.secret
        if not secret:
            return webhook_url
        
        timestamp, sign = self._generate_sign(secret)
        separator = "&" if "?" in webhook_url else "?"
        return f"{webhook_url}{separator}timestamp={timestamp}&sign={sign}"
    
    async def send_text(
        self,
        content: str,
        webhook_url: Optional[str] = None,
        secret: Optional[str] = None,
        at_mobiles: Optional[list] = None,
        is_at_all: bool = False
    ) -> Dict[str, Any]:
        """发送文本消息"""
        webhook_url = webhook_url or self.webhook_url
        if not webhook_url:
            return {"errcode": 1, "errmsg": "Webhook URL not configured"}
        
        url = self._get_webhook_url_with_sign(webhook_url, secret)
        
        payload = {
            "msgtype": "text",
            "text": {
                "content": content
            },
            "at": {
                "atMobiles": at_mobiles or [],
                "isAtAll": is_at_all
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=10)
                return response.json()
            except Exception as e:
                return {"errcode": 1, "errmsg": str(e)}
    
    async def send_image(
        self,
        image_url: str,
        webhook_url: Optional[str] = None,
        secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """发送图片消息（通过 Markdown 中引用图片）"""
        webhook_url = webhook_url or self.webhook_url
        if not webhook_url:
            return {"errcode": 1, "errmsg": "Webhook URL not configured"}
        
        # 由于钉钉机器人不支持直接发送图片，我们使用 Markdown 格式
        markdown_content = f"![image]({image_url})"
        
        return await self.send_markdown(
            title="战报",
            content=markdown_content,
            webhook_url=webhook_url,
            secret=secret
        )
    
    async def send_markdown(
        self,
        title: str,
        content: str,
        webhook_url: Optional[str] = None,
        secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """发送 Markdown 消息"""
        webhook_url = webhook_url or self.webhook_url
        if not webhook_url:
            return {"errcode": 1, "errmsg": "Webhook URL not configured"}
        
        url = self._get_webhook_url_with_sign(webhook_url, secret)
        
        payload = {
            "msgtype": "markdown",
            "markdown": {
                "title": title,
                "text": content
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=10)
                return response.json()
            except Exception as e:
                return {"errcode": 1, "errmsg": str(e)}
    
    async def send_link(
        self,
        title: str,
        text: str,
        message_url: str,
        pic_url: Optional[str] = None,
        webhook_url: Optional[str] = None,
        secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """发送链接消息"""
        webhook_url = webhook_url or self.webhook_url
        if not webhook_url:
            return {"errcode": 1, "errmsg": "Webhook URL not configured"}
        
        url = self._get_webhook_url_with_sign(webhook_url, secret)
        
        payload = {
            "msgtype": "link",
            "link": {
                "title": title,
                "text": text,
                "messageUrl": message_url,
                "picUrl": pic_url or ""
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=10)
                return response.json()
            except Exception as e:
                return {"errcode": 1, "errmsg": str(e)}
    
    async def send_card(
        self,
        card_content: Dict[str, Any],
        webhook_url: Optional[str] = None,
        secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """发送卡片消息"""
        webhook_url = webhook_url or self.webhook_url
        if not webhook_url:
            return {"errcode": 1, "errmsg": "Webhook URL not configured"}
        
        url = self._get_webhook_url_with_sign(webhook_url, secret)
        
        payload = {
            "msgtype": "actionCard",
            "actionCard": card_content
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=10)
                return response.json()
            except Exception as e:
                return {"errcode": 1, "errmsg": str(e)}
    
    def format_battle_report(
        self,
        params: Dict[str, Any],
        image_url: str,
        template_name: str = "战报"
    ) -> tuple[str, str]:
        """
        格式化战报消息
        
        Returns:
            (title, markdown_content)
        """
        title = f"📊 {params.get('title', template_name)}"
        
        lines = [
            f"### 📊 {params.get('title', template_name)}\n",
        ]
        
        # 添加基本信息
        if params.get("username"):
            lines.append(f"👤 **用户**: {params['username']}")
        if params.get("score"):
            lines.append(f"🎯 **得分**: {params['score']}")
        if params.get("rank"):
            lines.append(f"🏆 **排名**: 第 {params['rank']} 名")
        if params.get("date"):
            lines.append(f"📅 **日期**: {params['date']}")
        
        lines.append("\n---\n")
        lines.append(f"![战报图片]({image_url})")
        
        content = "\n".join(lines)
        return title, content


# 全局单例
dingtalk_service = DingTalkService()
