"use client";

import { useState } from "react";
import type { TemplateElement } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface PropertyPanelProps {
  element: TemplateElement | null;
  onChange: (element: TemplateElement) => void;
}

export function PropertyPanel({ element, onChange }: PropertyPanelProps) {
  if (!element) {
    return (
      <div className="w-72 border-l bg-white p-4">
        <div className="text-center text-gray-400 mt-8">
          <p>👈 请选择画布中的元素</p>
          <p className="text-sm mt-2">或从左侧添加新元素</p>
        </div>
      </div>
    );
  }

  const updateField = (field: keyof TemplateElement, value: unknown) => {
    onChange({ ...element, [field]: value });
  };

  return (
    <div className="w-72 border-l bg-white p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">属性配置</h3>

      {/* 基础属性 */}
      <div className="space-y-4">
        <div>
          <Label className="text-xs">名称</Label>
          <Input
            value={element.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="h-8"
          />
        </div>

        {/* 位置 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X 坐标</Label>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => updateField("x", Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Y 坐标</Label>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => updateField("y", Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        {/* 尺寸 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">宽度</Label>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => updateField("width", Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">高度</Label>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => updateField("height", Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        {/* 旋转 */}
        <div>
          <Label className="text-xs">旋转角度</Label>
          <Slider
            value={[element.rotation || 0]}
            min={0}
            max={360}
            step={1}
            onValueChange={([v]) => updateField("rotation", v)}
            className="mt-2"
          />
          <span className="text-xs text-gray-500">{element.rotation}°</span>
        </div>

        {/* 透明度 */}
        <div>
          <Label className="text-xs">透明度</Label>
          <Slider
            value={[element.opacity ?? 1]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([v]) => updateField("opacity", v)}
            className="mt-2"
          />
          <span className="text-xs text-gray-500">
            {Math.round((element.opacity ?? 1) * 100)}%
          </span>
        </div>

        {/* 文本属性 */}
        {element.type === "text" && (
          <>
            <hr className="my-4" />
            <h4 className="text-xs font-semibold text-gray-500">文本属性</h4>

            <div>
              <Label className="text-xs">内容</Label>
              <textarea
                value={element.content || ""}
                onChange={(e) => updateField("content", e.target.value)}
                className="w-full h-20 p-2 text-sm border rounded-md"
                placeholder="输入文本内容，支持 {{变量名}}"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">字体</Label>
                <Select
                  value={element.font_family || "sans-serif"}
                  onValueChange={(v) => updateField("font_family", v)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans-serif">黑体</SelectItem>
                    <SelectItem value="serif">宋体</SelectItem>
                    <SelectItem value="monospace">等宽字体</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">字号</Label>
                <Input
                  type="number"
                  value={element.font_size || 24}
                  onChange={(e) => updateField("font_size", Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">颜色</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.font_color || "#000000"}
                    onChange={(e) => updateField("font_color", e.target.value)}
                    className="h-8 w-12"
                  />
                  <Input
                    value={element.font_color || "#000000"}
                    onChange={(e) => updateField("font_color", e.target.value)}
                    className="h-8 flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">对齐</Label>
                <Select
                  value={element.text_align || "left"}
                  onValueChange={(v) => updateField("text_align", v)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">左对齐</SelectItem>
                    <SelectItem value="center">居中</SelectItem>
                    <SelectItem value="right">右对齐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">绑定字段</Label>
              <Input
                value={element.binding_field || ""}
                onChange={(e) => updateField("binding_field", e.target.value)}
                className="h-8"
                placeholder="如: username"
              />
              <p className="text-xs text-gray-400 mt-1">
                渲染时会被 params 中的值替换
              </p>
            </div>
          </>
        )}

        {/* 图片属性 */}
        {element.type === "image" && (
          <>
            <hr className="my-4" />
            <h4 className="text-xs font-semibold text-gray-500">图片属性</h4>

            {/* 图片预览 */}
            {element.src && (
              <div className="mb-3">
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={element.src}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* 上传按钮 */}
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateField("src", event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = "";
                }}
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 w-full h-10 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {element.src ? "更换图片" : "上传图片"}
              </label>
            </div>

            {/* 清除图片 */}
            {element.src && (
              <button
                onClick={() => updateField("src", "")}
                className="w-full h-8 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                清除图片
              </button>
            )}

            <div>
              <Label className="text-xs">圆角</Label>
              <Slider
                value={[element.border_radius || 0]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateField("border_radius", v)}
                className="mt-2"
              />
              <span className="text-xs text-gray-500">{element.border_radius}px</span>
            </div>
          </>
        )}

        {/* 层级控制 */}
        <hr className="my-4" />
        <h4 className="text-xs font-semibold text-gray-500">层级</h4>
        <div>
          <Label className="text-xs">Z-Index</Label>
          <Input
            type="number"
            value={element.z_index || 0}
            onChange={(e) => updateField("z_index", Number(e.target.value))}
            className="h-8"
          />
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.visible ?? true}
              onChange={(e) => updateField("visible", e.target.checked)}
            />
            <span className="text-xs">可见</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.lock ?? false}
              onChange={(e) => updateField("lock", e.target.checked)}
            />
            <span className="text-xs">锁定</span>
          </label>
        </div>
      </div>
    </div>
  );
}
