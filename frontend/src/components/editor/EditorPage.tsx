"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { CanvasEditor, createElement } from "@/components/editor/Canvas";
import type { CanvasEditorHandle } from "@/components/editor/Canvas";
import { ElementPalette } from "@/components/editor/ElementPalette";
import { PropertyPanel } from "@/components/editor/PropertyPanel";
import { LayersPanel } from "@/components/editor/LayersPanel";
import type { TemplateElement, Template } from "@/lib/api";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  Eye,
  Send,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Settings2,
  ImageOff,
  Loader2,
  X,
  Home,
  ArrowLeft,
} from "lucide-react";

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
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [background, setBackground] = useState<string>(template?.background_image || "");
  const [showLayers, setShowLayers] = useState(true);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [pendingWidth, setPendingWidth] = useState(width);
  const [pendingHeight, setPendingHeight] = useState(height);
  const [templateId, setTemplateId] = useState<string | null>(template?.id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<CanvasEditorHandle>(null);

  // 当 template prop 更新时，同步 elements state
  useEffect(() => {
    if (template?.elements) {
      setElements(template.elements);
    }
    if (template?.id) {
      setTemplateId(template.id);
    }
    if (template?.name) {
      setName(template.name);
    }
    if (template?.width) {
      setWidth(template.width);
    }
    if (template?.height) {
      setHeight(template.height);
    }
    if (template?.background_image !== undefined) {
      setBackground(template.background_image || "");
    }
  }, [template]);

  // 预设画布尺寸
  const canvasPresets = [
    { label: "手机竖屏", w: 750, h: 1334 },
    { label: "手机横屏", w: 1334, h: 750 },
    { label: "A4 纵向", w: 794, h: 1123 },
    { label: "A4 横向", w: 1123, h: 794 },
    { label: "正方形", w: 800, h: 800 },
    { label: "海报", w: 900, h: 1600 },
    { label: "横幅", w: 1920, h: 600 },
    { label: "名片", w: 900, h: 540 },
  ];

  const handleSetBackground = useCallback(() => {
    const fileInput = document.getElementById("bg-image-upload") as HTMLInputElement;
    fileInput?.click();
  }, []);

  const handleClearBackground = useCallback(() => {
    canvasRef.current?.clearBackground();
    setBackground("");
  }, []);

  const handleAddElement = useCallback((type: TemplateElement["type"]) => {
    const newElement = createElement(type, {
      x: width / 2 - 50,
      y: height / 2 - 25,
    });
    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [width, height]);

  const handleUpdateElement = useCallback((updated: TemplateElement) => {
    setElements((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
    setSelectedElement(updated);
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedElement((prev) => (prev?.id === id ? null : prev));
  }, []);

  const handleMoveUp = useCallback((id: string) => {
    setElements((prev) => {
      const sorted = [...prev].sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
      const index = sorted.findIndex((el) => el.id === id);
      if (index < sorted.length - 1) {
        const temp = sorted[index].z_index || 0;
        sorted[index].z_index = sorted[index + 1].z_index || 0;
        sorted[index + 1].z_index = temp;
      }
      return sorted;
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setElements((prev) => {
      const sorted = [...prev].sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
      const index = sorted.findIndex((el) => el.id === id);
      if (index > 0) {
        const temp = sorted[index].z_index || 0;
        sorted[index].z_index = sorted[index - 1].z_index || 0;
        sorted[index - 1].z_index = temp;
      }
      return sorted;
    });
  }, []);

  const handleToggleVisible = useCallback((id: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, visible: el.visible === false ? true : false } : el))
    );
  }, []);

  const handleToggleLock = useCallback((id: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, lock: el.lock ? false : true } : el))
    );
  }, []);

  const handleApplyCanvasSize = useCallback(() => {
    setWidth(pendingWidth);
    setHeight(pendingHeight);
    setShowCanvasSettings(false);
    // 应用后重新适配屏幕
    setTimeout(() => canvasRef.current?.fitToScreen(), 100);
  }, [pendingWidth, pendingHeight]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = { name, width, height, elements, background_image: background };
      let saved: Template;
      if (templateId) {
        saved = await api.templates.update(templateId, data);
      } else {
        saved = await api.templates.create(data);
        setTemplateId(saved.id);
      }
      toast.success("保存成功！");
      onSave?.(saved);
    } catch (err) {
      console.error("保存失败:", err);
      toast.error("保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }, [name, width, height, elements, background, templateId, onSave]);

  const handlePreview = useCallback(() => {
    // 根据屏幕可用空间计算缩放比例，确保预览完整显示
    const screenWidth = window.innerWidth * 0.85;  // 留边距
    const screenHeight = window.innerHeight * 0.8; // 留边距
    const scaleX = screenWidth / width;
    const scaleY = screenHeight / height;
    const multiplier = Math.min(scaleX, scaleY, 2); // 不超过 2x
    
    const dataUrl = canvasRef.current?.toDataURL({ format: "png", multiplier });
    if (dataUrl) {
      setPreviewUrl(dataUrl);
    } else {
      toast.error("预览失败");
    }
  }, [width, height]);

  const handlePublish = useCallback(async () => {
    // 先保存
    if (!templateId) {
      toast.warning("请先保存模板");
      return;
    }
    setIsLoading(true);
    try {
      const saved = await api.templates.publish(templateId);
      toast.success("发布成功！");
      onSave?.(saved);
    } catch (err) {
      console.error("发布失败:", err);
      toast.error("发布失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }, [templateId, onSave]);

  const scalePercent = Math.round(canvasScale * 100);

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部工具栏 */}
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* 返回模板管理 */}
          <Link
            href="/templates"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            title="返回模板管理"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回</span>
          </Link>
          
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-52 h-9 font-semibold"
            placeholder="模板名称"
          />
          {/* 画布尺寸 - 点击展开设置 */}
          <button
            onClick={() => {
              setPendingWidth(width);
              setPendingHeight(height);
              setShowCanvasSettings((v) => !v);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            title="画布大小设置"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{width} × {height}px</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showLayers ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLayers(!showLayers)}
          >
            <Layers className="w-4 h-4 mr-1" />
            图层
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
            预览
          </Button>
          <Button variant="outline" size="sm" onClick={handleSetBackground}>
            <Settings2 className="w-4 h-4 mr-1" />
            设置背景
          </Button>
          {background && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearBackground}
              className="text-red-500 border-red-200 hover:bg-red-50"
              title="清除背景图片"
            >
              <ImageOff className="w-4 h-4 mr-1" />
              清除背景
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            保存
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            发布
          </Button>
        </div>
      </header>

      {/* 画布大小设置面板（内联下拉） */}
      {showCanvasSettings && (
        <div className="border-b bg-gray-50 px-4 py-3 flex items-end gap-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-600 w-8">宽</Label>
            <Input
              type="number"
              value={pendingWidth}
              onChange={(e) => setPendingWidth(Number(e.target.value))}
              className="h-8 w-24"
              min={100}
              max={5000}
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-600 w-8">高</Label>
            <Input
              type="number"
              value={pendingHeight}
              onChange={(e) => setPendingHeight(Number(e.target.value))}
              className="h-8 w-24"
              min={100}
              max={5000}
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          {/* 预设尺寸 */}
          <div className="flex items-center gap-1 flex-wrap">
            {canvasPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => { setPendingWidth(p.w); setPendingHeight(p.h); }}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  pendingWidth === p.w && pendingHeight === p.h
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {p.label} {p.w}×{p.h}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Button size="sm" onClick={handleApplyCanvasSize}>
              应用
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCanvasSettings(false)}
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        <ElementPalette onAddElement={handleAddElement} />
        <CanvasEditor
          ref={canvasRef}
          width={width}
          height={height}
          elements={elements}
          onChange={setElements}
          onSelect={setSelectedElement}
          selectedElement={selectedElement}
          onBackgroundChange={setBackground}
          onScaleChange={setCanvasScale}
        />
        <PropertyPanel element={selectedElement} onChange={handleUpdateElement} />

        {showLayers && (
          <LayersPanel
            elements={elements}
            selectedElement={selectedElement}
            onSelect={setSelectedElement}
            onDelete={handleDeleteElement}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onToggleVisible={handleToggleVisible}
            onToggleLock={handleToggleLock}
            onUpdateElements={setElements}
          />
        )}
      </div>

      {/* 预览模态框 - 全屏半透明黑色蒙版 */}
      {previewUrl && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => { setPreviewUrl(null); URL.revokeObjectURL(previewUrl); }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); URL.revokeObjectURL(previewUrl); }}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              zIndex: 10,
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* 尺寸信息 */}
          <div style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            {width} × {height}px
          </div>
          
          {/* 预览图片容器 */}
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '80vh',
              padding: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(4px)',
              borderRadius: 16,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewUrl} 
              alt="预览" 
              style={{ 
                maxWidth: '90vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          </div>
        </div>
      )}

      {/* 底部状态栏 */}
      <footer className="h-9 border-t bg-white px-4 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>元素: {elements.length}</span>
          <span className="text-gray-300">|</span>
          <span>画布: {width} × {height}px</span>
          {background && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-green-600">已设置背景</span>
            </>
          )}
        </div>

        {/* 缩放控件 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => canvasRef.current?.adjustScale(-0.1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-medium tabular-nums">{scalePercent}%</span>
          <button
            onClick={() => canvasRef.current?.adjustScale(0.1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="放大"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => canvasRef.current?.fitToScreen()}
            className="ml-1 px-2 py-0.5 hover:bg-gray-100 rounded transition-colors text-xs flex items-center gap-1"
            title="适配屏幕"
          >
            <Maximize2 className="w-3 h-3" />
            适配
          </button>
          {/* 快捷缩放级别 */}
          {[50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => canvasRef.current?.adjustScale(p / 100 - canvasScale)}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                scalePercent === p ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        <div>
          {selectedElement ? (
            <span>选中: <span className="text-gray-700">{selectedElement.type}</span> — {selectedElement.name}</span>
          ) : (
            <span>未选中元素</span>
          )}
        </div>
      </footer>
    </div>
  );
}
