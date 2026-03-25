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

            <div>
              <Label className="text-xs">图片地址</Label>
              <Input
                value={element.src || ""}
                onChange={(e) => updateField("src", e.target.value)}
                className="h-8"
                placeholder="输入图片 URL"
              />
            </div>

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

        {/* 形状属性 */}
        {element.type === "shape" && (
          <>
            <hr className="my-4" />
            <h4 className="text-xs font-semibold text-gray-500">形状属性</h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">填充颜色</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.fill_color || "#ffffff"}
                    onChange={(e) => updateField("fill_color", e.target.value)}
                    className="h-8 w-12"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">边框颜色</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.stroke_color || "#000000"}
                    onChange={(e) => updateField("stroke_color", e.target.value)}
                    className="h-8 w-12"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 图表属性 */}
        {element.type === "chart" && (
          <>
            <hr className="my-4" />
            <h4 className="text-xs font-semibold text-gray-500">图表属性</h4>

            <div>
              <Label className="text-xs">图表类型</Label>
              <Select
                value={element.chart_type || "bar"}
                onValueChange={(v) => updateField("chart_type", v)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">柱状图</SelectItem>
                  <SelectItem value="progress">进度条</SelectItem>
                  <SelectItem value="pie">饼图</SelectItem>
                </SelectContent>
              </Select>
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
