"use client";

import { useCallback } from "react";
import type { TemplateElement } from "@/lib/api";
import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown, Type, Image, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayersPanelProps {
  elements: TemplateElement[];
  selectedElement: TemplateElement | null;
  onSelect: (element: TemplateElement | null) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateElements: (elements: TemplateElement[]) => void;
}

export function LayersPanel({
  elements,
  selectedElement,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
  onToggleLock,
  onUpdateElements,
}: LayersPanelProps) {
  // 按 z_index 排序，从上到下显示（索引0是最顶层）
  const sortedElements = [...elements].sort((a, b) => (b.z_index || 0) - (a.z_index || 0));

  const getElementIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="w-4 h-4 text-blue-500" />;
      case "image":
        return <Image className="w-4 h-4 text-green-500" />;
      default:
        return <Square className="w-4 h-4 text-gray-500" />;
    }
  };

  const getElementLabel = (element: TemplateElement) => {
    switch (element.type) {
      case "text":
        return element.content?.slice(0, 20) || "文本";
      case "image":
        return element.src ? "图片" : "图片(未设置)";
      default:
        return element.name || "元素";
    }
  };

  const handleMoveToTop = useCallback((id: string) => {
    const maxZ = Math.max(...elements.map((el) => el.z_index || 0), 0);
    onUpdateElements(
      elements.map((el) =>
        el.id === id ? { ...el, z_index: maxZ + 1 } : el
      )
    );
  }, [elements, onUpdateElements]);

  const handleMoveToBottom = useCallback((id: string) => {
    const minZ = Math.min(...elements.map((el) => el.z_index || 0), 0);
    onUpdateElements(
      elements.map((el) =>
        el.id === id ? { ...el, z_index: minZ - 1 } : el
      )
    );
  }, [elements, onUpdateElements]);

  if (elements.length === 0) {
    return (
      <div className="w-64 border-l bg-white flex flex-col">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Square className="w-4 h-4" />
            图层
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-4">
          <div className="text-center">
            <p>暂无图层</p>
            <p className="text-xs mt-1">从左侧拖入元素</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l bg-white flex flex-col">
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Square className="w-4 h-4" />
          图层 ({elements.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {sortedElements.map((element, index) => {
            const isSelected = selectedElement?.id === element.id;
            const isFirst = index === 0;
            const isLast = index === sortedElements.length - 1;

            return (
              <div
                key={element.id}
                className={`
                  group rounded-md border transition-all cursor-pointer
                  ${isSelected
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                  ${element.visible === false ? "opacity-50" : ""}
                `}
                onClick={() => onSelect(element)}
              >
                <div className="flex items-center gap-2 p-2">
                  {/* 元素图标 */}
                  <div className="flex-shrink-0">
                    {getElementIcon(element.type)}
                  </div>

                  {/* 元素名称 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{element.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {getElementLabel(element)}
                    </p>
                  </div>

                  {/* 快捷操作按钮 */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisible(element.id!);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title={element.visible !== false ? "隐藏" : "显示"}
                    >
                      {element.visible !== false ? (
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLock(element.id!);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title={element.lock ? "解锁" : "锁定"}
                    >
                      {element.lock ? (
                        <Lock className="w-3.5 h-3.5 text-orange-500" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(element.id!);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* 层级操作栏 */}
                <div className="flex items-center justify-between px-2 pb-1.5 text-xs border-t border-gray-100 pt-1">
                  <span className="text-gray-400">层级 {sortedElements.length - index}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToTop(element.id!);
                      }}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      disabled={isFirst}
                      title="移到顶层"
                    >
                      ⬆⬆
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(element.id!);
                      }}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      disabled={isFirst}
                      title="上移一层"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(element.id!);
                      }}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      disabled={isLast}
                      title="下移一层"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToBottom(element.id!);
                      }}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      disabled={isLast}
                      title="移到底层"
                    >
                      ⬇⬇
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
