"use client";

import { Type, Image } from "lucide-react";
import type { TemplateElement } from "@/lib/api";

interface ElementPaletteProps {
  onAddElement: (type: TemplateElement["type"]) => void;
}

const elements = [
  { type: "text" as const, label: "文本", icon: Type, color: "bg-blue-500" },
  { type: "image" as const, label: "图片", icon: Image, color: "bg-green-500" },
];

export function ElementPalette({ onAddElement }: ElementPaletteProps) {
  return (
    <div className="w-64 border-r bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">元素组件</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {elements.map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onAddElement(type)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("elementType", type);
            }}
          >
            <div className={`p-2 rounded-lg ${color} text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">快捷操作</h3>
        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            💡 拖拽元素到画布添加
          </p>
          <p className="text-xs text-gray-400">
            ✏️ 双击文本元素可编辑
          </p>
          <p className="text-xs text-gray-400">
            📐 拖拽控制点调整大小
          </p>
        </div>
      </div>
    </div>
  );
}
