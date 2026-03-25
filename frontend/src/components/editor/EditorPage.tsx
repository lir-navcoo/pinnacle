"use client";

import { useState, useCallback } from "react";
import { CanvasEditor, createElement } from "@/components/editor/Canvas";
import { ElementPalette } from "@/components/editor/ElementPalette";
import { PropertyPanel } from "@/components/editor/PropertyPanel";
import type { TemplateElement, Template } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Eye, Send, Plus } from "lucide-react";

interface EditorPageProps {
  template?: Template;
  onSave?: (data: Partial<Template>) => void;
}

export function EditorPage({ template, onSave }: EditorPageProps) {
  const [name, setName] = useState(template?.name || "未命名模板");
  const [width, setWidth] = useState(template?.width || 750);
  const [height, setHeight] = useState(template?.height || 1334);
  const [elements, setElements] = useState<TemplateElement[]>(
    template?.elements || []
  );
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(
    null
  );

  const handleAddElement = useCallback((type: TemplateElement["type"]) => {
    const newElement = createElement(type, {
      x: width / 2 - 50,
      y: height / 2 - 25,
    });
    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [width, height]);

  const handleUpdateElement = useCallback((updated: TemplateElement) => {
    setElements((prev) =>
      prev.map((el) => (el.id === updated.id ? updated : el))
    );
    setSelectedElement(updated);
  }, []);

  const handleDeleteElement = useCallback(() => {
    if (selectedElement) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElement.id));
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const handleSave = useCallback(() => {
    onSave?.({
      name,
      width,
      height,
      elements,
    });
  }, [name, width, height, elements, onSave]);

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部工具栏 */}
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-64 h-9 font-semibold"
            placeholder="模板名称"
          />
          <span className="text-sm text-gray-500">
            {width} × {height}px
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            预览
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            设为背景
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm">
            <Send className="w-4 h-4 mr-1" />
            发布
          </Button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        <ElementPalette onAddElement={handleAddElement} />
        <CanvasEditor
          width={width}
          height={height}
          elements={elements}
          onChange={setElements}
          onSelect={setSelectedElement}
          selectedElement={selectedElement}
        />
        <PropertyPanel element={selectedElement} onChange={handleUpdateElement} />
      </div>

      {/* 底部状态栏 */}
      <footer className="h-8 border-t bg-white px-4 flex items-center justify-between text-xs text-gray-500">
        <div>
          元素数量: {elements.length} | 
          画布尺寸: {width} × {height}
        </div>
        <div>
          {selectedElement ? (
            <>选中: {selectedElement.type} - {selectedElement.name}</>
          ) : (
            <>未选中元素</>
          )}
        </div>
      </footer>
    </div>
  );
}
