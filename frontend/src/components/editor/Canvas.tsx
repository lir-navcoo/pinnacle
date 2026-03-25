"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as fabric from "fabric";
import type { TemplateElement } from "@/lib/api";
import { generateId } from "@/lib/utils";

interface CanvasEditorProps {
  width: number;
  height: number;
  elements: TemplateElement[];
  onChange: (elements: TemplateElement[]) => void;
  onSelect: (element: TemplateElement | null) => void;
  selectedElement: TemplateElement | null;
}

export function CanvasEditor({
  width,
  height,
  elements,
  onChange,
  onSelect,
  selectedElement,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 初始化 Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#f0f0f0",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // 计算缩放比例
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 64;
        const newScale = Math.min(containerWidth / width, 1);
        setScale(newScale);
        canvas.setZoom(newScale);
        canvas.setDimensions({
          width: width * newScale,
          height: height * newScale,
        });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    // 选择事件
    canvas.on("selection:created", (e) => {
      const active = e.selected?.[0];
      if (active) {
        const el = elements.find((el) => el.id === active.get("elementId"));
        onSelect(el || null);
      }
    });

    canvas.on("selection:updated", (e) => {
      const active = e.selected?.[0];
      if (active) {
        const el = elements.find((el) => el.id === active.get("elementId"));
        onSelect(el || null);
      }
    });

    canvas.on("selection:cleared", () => {
      onSelect(null);
    });

    // 拖拽/缩放事件
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;

      const elementId = obj.get("elementId");
      const updatedElements = elements.map((el) => {
        if (el.id === elementId) {
          return {
            ...el,
            x: obj.left || 0,
            y: obj.top || 0,
            width: (obj.width || 0) * (obj.scaleX || 1),
            height: (obj.height || 0) * (obj.scaleY || 1),
            rotation: obj.angle || 0,
          };
        }
        return el;
      });

      onChange(updatedElements);
    });

    return () => {
      window.removeEventListener("resize", updateScale);
      canvas.dispose();
    };
  }, []);

  // 同步元素到 Canvas
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 清除所有对象
    canvas.clear();
    canvas.backgroundColor = "#f0f0f0";

    // 重新添加背景矩形（模拟画布）
    const bgRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height,
      fill: "#ffffff",
      selectable: false,
      evented: false,
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.2)",
        blur: 10,
        offsetX: 0,
        offsetY: 4,
      }),
    });
    canvas.add(bgRect);

    // 添加元素
    elements.forEach((element) => {
      let obj: fabric.Object | null = null;

      if (element.type === "text") {
        obj = new fabric.IText(element.content || "双击编辑", {
          left: element.x,
          top: element.y,
          fontSize: element.font_size || 24,
          fontFamily: element.font_family || "sans-serif",
          fill: element.font_color || "#000000",
          textAlign: element.text_align || "left",
          angle: element.rotation,
          opacity: element.opacity,
          elementId: element.id,
        });
      } else if (element.type === "image" && element.src) {
        fabric.FabricImage.fromURL(element.src, {
          crossOrigin: "anonymous",
        }).then((img) => {
          img.set({
            left: element.x,
            top: element.y,
            scaleX: (element.width || 100) / (img.width || 100),
            scaleY: (element.height || 100) / (img.height || 100),
            angle: element.rotation,
            opacity: element.opacity,
            elementId: element.id,
          });
          canvas.add(img);
          canvas.renderAll();
        });
      } else if (element.type === "shape") {
        obj = new fabric.Rect({
          left: element.x,
          top: element.y,
          width: element.width || 100,
          height: element.height || 100,
          fill: element.fill_color || "#ffffff",
          stroke: element.stroke_color || "#000000",
          strokeWidth: element.stroke_width || 1,
          rx: element.border_radius || 0,
          angle: element.rotation,
          opacity: element.opacity,
          elementId: element.id,
        });
      }

      if (obj) {
        canvas.add(obj);
      }
    });

    canvas.renderAll();
  }, [elements, width, height]);

  // 更新选中元素样式
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.forEachObject((obj) => {
      const elementId = obj.get("elementId");
      if (elementId === selectedElement?.id) {
        canvas.setActiveObject(obj);
      }
    });
    canvas.renderAll();
  }, [selectedElement]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-8 bg-gray-100">
      <div
        className="mx-auto shadow-xl"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// 添加元素的辅助函数
export function createElement(
  type: TemplateElement["type"],
  position: { x: number; y: number }
): TemplateElement {
  const base = {
    id: generateId(),
    name: `${type}-${generateId().slice(0, 4)}`,
    x: position.x,
    y: position.y,
    width: type === "text" ? 200 : 100,
    height: type === "text" ? 50 : 100,
    rotation: 0,
    z_index: Date.now(),
    opacity: 1,
    lock: false,
    visible: true,
  };

  switch (type) {
    case "text":
      return {
        ...base,
        type: "text",
        content: "输入文字",
        font_family: "sans-serif",
        font_size: 24,
        font_color: "#000000",
        text_align: "left",
      };
    case "image":
      return {
        ...base,
        type: "image",
        src: "",
        border_radius: 0,
      };
    case "shape":
      return {
        ...base,
        type: "shape",
        shape_type: "rect",
        fill_color: "#ffffff",
        stroke_color: "#000000",
        stroke_width: 1,
      };
    case "chart":
      return {
        ...base,
        type: "chart",
        chart_type: "bar",
        data: [],
      };
    default:
      return { ...base, type: "text", content: "" };
  }
}
