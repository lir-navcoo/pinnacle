"""
渲染引擎服务
"""

import re
import io
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import httpx

from app.core.config import settings


class RendererService:
    """图片渲染引擎"""
    
    def __init__(self):
        self.font_cache: Dict[str, ImageFont.FreeTypeFont] = {}
        self.default_font = "sans-serif"
    
    def _get_font(self, font_family: str, font_size: float) -> ImageFont.FreeTypeFont:
        """获取字体（带缓存）"""
        cache_key = f"{font_family}_{font_size}"
        if cache_key not in self.font_cache:
            try:
                # 尝试加载系统字体
                self.font_cache[cache_key] = ImageFont.truetype(
                    font_family, 
                    int(font_size)
                )
            except (OSError, IOError):
                # 回退到默认字体
                self.font_cache[cache_key] = ImageFont.load_default()
        return self.font_cache[cache_key]
    
    def _parse_template_var(self, text: str, params: Dict[str, Any]) -> str:
        """解析模板变量 {{field}} 或 {{field, formatter}}"""
        def replace_var(match):
            content = match.group(1)
            if "," in content:
                field, formatter = content.split(",", 1)
                field = field.strip()
                formatter = formatter.strip()
                value = params.get(field, "")
                
                # 应用格式化器
                if formatter == "thousand" and isinstance(value, (int, float)):
                    return f"{value:,}"
                elif formatter == "percent" and isinstance(value, (int, float)):
                    return f"{value}%"
                elif formatter == "yuan" and isinstance(value, (int, float)):
                    return f"¥{value:,.2f}"
                return str(value)
            else:
                return str(params.get(content.strip(), match.group(0)))
        
        return re.sub(r"\{\{(.+?)\}\}", replace_var, text)
    
    async def render(
        self,
        template: Dict[str, Any],
        params: Dict[str, Any],
        format: str = "png",
        quality: int = 95
    ) -> bytes:
        """
        渲染战报图片
        
        Args:
            template: 模板数据（包含 elements, width, height, background 等）
            params: 渲染参数
            format: 输出格式
            quality: 图片质量
        
        Returns:
            bytes: 生成的图片二进制数据
        """
        width = template.get("width", 750)
        height = template.get("height", 1334)
        background_color = template.get("background_color", "#ffffff")
        background_image = template.get("background_image")
        elements = template.get("elements", [])
        
        # 创建画布
        img = Image.new("RGB", (width, height), background_color)
        draw = ImageDraw.Draw(img)
        
        # 绘制背景图
        if background_image:
            bg_img = await self._load_image(background_image)
            if bg_img:
                # 缩放背景图以填满画布
                bg_img = bg_img.resize((width, height), Image.Resampling.LANCZOS)
                img.paste(bg_img, (0, 0))
                draw = ImageDraw.Draw(img)
        
        # 按 z_index 排序元素
        sorted_elements = sorted(elements, key=lambda e: e.get("z_index", 0))
        
        # 渲染每个元素
        for element in sorted_elements:
            if not element.get("visible", True):
                continue
            
            element_type = element.get("type")
            x = element.get("x", 0)
            y = element.get("y", 0)
            opacity = element.get("opacity", 1)
            
            if element_type == "text":
                self._render_text(img, draw, element, params, x, y)
            elif element_type == "image":
                await self._render_image(img, element, params, x, y)
            elif element_type == "shape":
                self._render_shape(img, draw, element, x, y)
            elif element_type == "chart":
                self._render_chart(img, draw, element, params, x, y)
        
        # 转换格式
        if format.lower() in ("jpeg", "jpg"):
            img = img.convert("RGB")
        
        # 返回二进制
        output = io.BytesIO()
        img.save(output, format=format.upper() if format.lower() != "jpg" else "JPEG", quality=quality)
        return output.getvalue()
    
    def _render_text(
        self, 
        img: Image.Image, 
        draw: ImageDraw.Draw, 
        element: Dict[str, Any],
        params: Dict[str, Any],
        x: float,
        y: float
    ):
        """渲染文本元素"""
        content = element.get("content", "")
        font_family = element.get("font_family", "sans-serif")
        font_size = element.get("font_size", 24)
        font_color = element.get("font_color", "#000000")
        font_weight = element.get("font_weight", "normal")
        text_align = element.get("text_align", "left")
        line_height = element.get("line_height", 1.5)
        
        # 解析模板变量
        content = self._parse_template_var(content, params)
        
        # 解析颜色
        if font_color.startswith("#"):
            font_color = tuple(int(font_color[i:i+2], 16) for i in (1, 3, 5))
        
        # 获取字体
        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", int(font_size))
        except:
            font = ImageFont.load_default()
        
        # 计算文本位置
        width = element.get("width", 200)
        height = element.get("height", font_size * line_height)
        
        # 文本换行处理
        lines = content.split("\n")
        current_y = y
        for line in lines:
            if text_align == "center":
                bbox = draw.textbbox((0, 0), line, font=font)
                line_width = bbox[2] - bbox[0]
                text_x = x + (width - line_width) / 2
            elif text_align == "right":
                bbox = draw.textbbox((0, 0), line, font=font)
                line_width = bbox[2] - bbox[0]
                text_x = x + width - line_width
            else:
                text_x = x
            
            draw.text((text_x, current_y), line, font=font, fill=font_color)
            current_y += font_size * line_height
    
    async def _render_image(
        self,
        img: Image.Image,
        element: Dict[str, Any],
        params: Dict[str, Any],
        x: float,
        y: float
    ):
        """渲染图片元素"""
        src = element.get("src", "")
        width = int(element.get("width", 100))
        height = int(element.get("height", 100))
        border_radius = element.get("border_radius", 0)
        object_fit = element.get("object_fit", "cover")
        
        # 解析模板变量
        src = self._parse_template_var(src, params)
        
        if not src:
            return
        
        # 加载图片
        elem_img = await self._load_image(src)
        if not elem_img:
            return
        
        # 调整图片大小
        elem_w, elem_h = elem_img.size
        target_ratio = width / height
        source_ratio = elem_w / elem_h
        
        if object_fit == "cover":
            if source_ratio > target_ratio:
                new_height = height
                new_width = int(elem_w * (height / elem_h))
                crop_left = (new_width - width) // 2
                crop_top = 0
            else:
                new_width = width
                new_height = int(elem_h * (width / elem_w))
                crop_left = 0
                crop_top = (new_height - height) // 2
            elem_img = elem_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            elem_img = elem_img.crop((crop_left, crop_top, crop_left + width, crop_top + height))
        elif object_fit == "contain":
            elem_img = elem_img.resize((width, height), Image.Resampling.LANCZOS)
            new_img = Image.new("RGBA", (width, height), (255, 255, 255, 0))
            offset = ((width - elem_img.width) // 2, (height - elem_img.height) // 2)
            new_img.paste(elem_img, offset)
            elem_img = new_img
        else:
            elem_img = elem_img.resize((width, height), Image.Resampling.LANCZOS)
        
        # 圆角处理
        if border_radius > 0:
            elem_img = self._round_corners(elem_img, border_radius)
        
        # 粘贴到画布
        if elem_img.mode == "RGBA":
            img.paste(elem_img, (int(x), int(y)), elem_img)
        else:
            img.paste(elem_img, (int(x), int(y)))
    
    def _render_shape(
        self,
        img: Image.Image,
        draw: ImageDraw.Draw,
        element: Dict[str, Any],
        x: float,
        y: float
    ):
        """渲染形状元素"""
        shape_type = element.get("shape_type", "rect")
        width = element.get("width", 100)
        height = element.get("height", 100)
        fill_color = element.get("fill_color", "#ffffff")
        stroke_color = element.get("stroke_color", "#000000")
        stroke_width = element.get("stroke_width", 1)
        
        # 解析颜色
        if fill_color.startswith("#"):
            fill_color = tuple(int(fill_color[i:i+2], 16) for i in (1, 3, 5))
        if stroke_color.startswith("#"):
            stroke_color = tuple(int(stroke_color[i:i+2], 16) for i in (1, 3, 5))
        
        bbox = [x, y, x + width, y + height]
        
        if shape_type == "circle":
            draw.ellipse(bbox, fill=fill_color, outline=stroke_color, width=int(stroke_width))
        else:
            draw.rectangle(bbox, fill=fill_color, outline=stroke_color, width=int(stroke_width))
    
    def _render_chart(
        self,
        img: Image.Image,
        draw: ImageDraw.Draw,
        element: Dict[str, Any],
        params: Dict[str, Any],
        x: float,
        y: float
    ):
        """渲染图表元素"""
        chart_type = element.get("chart_type", "bar")
        data = element.get("data", [])
        colors = element.get("colors", ["#1890ff", "#52c41a", "#faad14", "#f5222d"])
        width = element.get("width", 300)
        height = element.get("height", 200)
        
        # 解析数据中的模板变量
        parsed_data = []
        for item in data:
            if isinstance(item, dict):
                parsed_item = {
                    k: self._parse_template_var(str(v), params) if isinstance(v, str) else v
                    for k, v in item.items()
                }
                parsed_data.append(parsed_item)
            else:
                parsed_data.append(self._parse_template_var(str(item), params))
        
        if chart_type == "bar":
            self._render_bar_chart(draw, parsed_data, colors, x, y, width, height)
        elif chart_type == "progress":
            self._render_progress_chart(draw, parsed_data, colors, x, y, width, height)
    
    def _render_bar_chart(
        self,
        draw: ImageDraw.Draw,
        data: List[Dict],
        colors: List[str],
        x: float,
        y: float,
        width: float,
        height: float
    ):
        """渲染柱状图"""
        if not data:
            return
        
        label_key = data[0].get("label", "label") if isinstance(data[0], dict) else None
        value_key = data[0].get("value", "value") if isinstance(data[0], dict) else None
        
        max_value = max(
            float(item.get(value_key, item)) if isinstance(item, dict) else float(item)
            for item in data
        ) if max(data) else 1
        
        bar_count = len(data)
        bar_width = min(width / bar_count * 0.7, 50)
        gap = (width - bar_width * bar_count) / (bar_count + 1)
        
        for i, item in enumerate(data):
            value = float(item.get(value_key, item)) if isinstance(item, dict) else float(item)
            label = str(item.get(label_key, item)) if isinstance(item, dict) else str(item)
            
            bar_height = (value / max_value) * (height - 40)
            color = colors[i % len(colors)]
            
            if color.startswith("#"):
                color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
            
            # 绘制柱子
            bar_x = x + gap + i * (bar_width + gap)
            draw.rectangle(
                [bar_x, y + height - bar_height - 20, bar_x + bar_width, y + height - 20],
                fill=color
            )
            
            # 绘制标签
            try:
                font = ImageFont.load_default()
                draw.text((bar_x, y + height - 15), label[:5], fill=(100, 100, 100), font=font)
            except:
                pass
    
    def _render_progress_chart(
        self,
        draw: ImageDraw.Draw,
        data: List[Dict],
        colors: List[str],
        x: float,
        y: float,
        width: float,
        height: float
    ):
        """渲染进度条"""
        if not data:
            return
        
        value_key = data[0].get("value", "value") if isinstance(data[0], dict) else None
        label_key = data[0].get("label", "label") if isinstance(data[0], dict) else None
        
        for i, item in enumerate(data):
            value = float(item.get(value_key, item)) if isinstance(item, dict) else float(item)
            label = str(item.get(label_key, f"项目{i+1}")) if isinstance(item, dict) else str(item)
            
            progress = min(value / 100, 1)
            bar_height = 20
            bar_y = y + i * (bar_height + 15)
            
            # 背景条
            draw.rectangle(
                [x, bar_y, x + width, bar_y + bar_height],
                fill=(230, 230, 230)
            )
            
            # 进度条
            progress_color = colors[i % len(colors)]
            if progress_color.startswith("#"):
                progress_color = tuple(int(progress_color[i:i+2], 16) for i in (1, 3, 5))
            
            draw.rectangle(
                [x, bar_y, x + width * progress, bar_y + bar_height],
                fill=progress_color
            )
            
            # 标签
            try:
                font = ImageFont.load_default()
                draw.text((x, bar_y - 15), f"{label}: {value}%", fill=(50, 50, 50), font=font)
            except:
                pass
    
    async def _load_image(self, url: str) -> Optional[Image.Image]:
        """加载远程图片"""
        try:
            if url.startswith("http"):
                async with httpx.AsyncClient() as client:
                    response = await client.get(url, timeout=10)
                    if response.status_code == 200:
                        return Image.open(io.BytesIO(response.content))
            else:
                return Image.open(url)
        except Exception:
            return None
        return None
    
    def _round_corners(self, img: Image.Image, radius: float) -> Image.Image:
        """圆角处理"""
        circle = Image.new("L", (int(radius * 2), int(radius * 2)), 0)
        import PIL.ImageDraw
        PIL.ImageDraw.Draw(circle).ellipse((0, 0, radius * 2 - 1, radius * 2 - 1), fill=255)
        
        alpha = Image.new("L", img.size, 255)
        w, h = img.size
        
        alpha.paste(circle.crop((0, 0, radius, radius)), (0, 0))
        alpha.paste(circle.crop((radius, 0, radius * 2, radius)), (w - radius, 0))
        alpha.paste(circle.crop((0, radius, radius, radius * 2)), (0, h - radius))
        alpha.paste(circle.crop((radius, radius, radius * 2, radius * 2)), (w - radius, h - radius))
        
        img.putalpha(alpha)
        return img
    
    def generate_thumbnail(self, template: Dict[str, Any]) -> bytes:
        """生成缩略图（低分辨率预览）"""
        preview_template = {
            **template,
            "width": 375,
            "height": 667,
        }
        return self._sync_render(preview_template)
    
    def _sync_render(self, template: Dict[str, Any]) -> bytes:
        """同步渲染（用于缩略图）"""
        import asyncio
        return asyncio.run(self.render(template, {}, "png", 80))


# 全局单例
renderer_service = RendererService()
