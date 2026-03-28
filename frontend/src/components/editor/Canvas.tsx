"use client";

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import * as fabric from "fabric";
import type { TemplateElement } from "@/lib/api";
import { generateId } from "@/lib/utils";

export interface CanvasEditorHandle {
  clearBackground: () => void;
  adjustScale: (delta: number) => void;
  fitToScreen: () => void;
  getScale: () => number;
  toDataURL: (options?: { format?: string; quality?: number; multiplier?: number }) => string | null;
}

interface CanvasEditorProps {
  width: number;
  height: number;
  elements: TemplateElement[];
  onChange: (elements: TemplateElement[]) => void;
  onSelect: (element: TemplateElement | null) => void;
  selectedElement: TemplateElement | null;
  onBackgroundChange?: (bg: string) => void;
  onScaleChange?: (scale: number) => void;
}

// 创建新元素
export function createElement(
  type: TemplateElement["type"],
  position: { x: number; y: number }
): TemplateElement {
  const id = generateId();
  const base = {
    id,
    name: `${type}-${id.slice(0, 4)}`,
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
    default:
      return { ...base, type: "text", content: "" };
  }
}

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  function CanvasEditor(
    {
      width,
      height,
      elements,
      onChange,
      onSelect,
      selectedElement,
      onBackgroundChange,
      onScaleChange,
    },
    ref
  ) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [canvasBackground, setCanvasBackground] = useState<string>("");
  const elementsMapRef = useRef<Map<string, fabric.Object>>(new Map());
  const isUpdatingRef = useRef(false);
  const elementsRef = useRef(elements);
  const onChangeRef = useRef(onChange);
  const scaleRef = useRef(scale);

  // 保持 refs 最新
  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // 适配屏幕的缩放计算
  const calcFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.clientWidth - 64;
    const containerHeight = containerRef.current.clientHeight - 64;
    return Math.min(containerWidth / width, containerHeight / height, 1);
  }, [width, height]);

  // 应用缩放到 Fabric
  const applyScale = useCallback((newScale: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(newScale);
    canvas.setDimensions({
      width: width * newScale,
      height: height * newScale,
    });
    canvas.renderAll();
    setScale(newScale);
    onScaleChange?.(newScale);
  }, [width, height, onScaleChange]);

  // 初始化时适配屏幕，监听窗口变化
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      const newScale = calcFitScale();
      applyScale(newScale);
    };

    // 稍作延迟，等容器渲染完毕
    const timer = setTimeout(updateScale, 50);
    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, [calcFitScale, applyScale]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    clearBackground: () => {
      setCanvasBackground("");
      onBackgroundChange?.("");
    },
    adjustScale: (delta: number) => {
      const newScale = Math.max(0.1, Math.min(3, scaleRef.current + delta));
      applyScale(newScale);
    },
    fitToScreen: () => {
      const newScale = calcFitScale();
      applyScale(newScale);
    },
    getScale: () => scaleRef.current,
    toDataURL: (options?: { format?: string; quality?: number; multiplier?: number }) => {
      const canvas = fabricRef.current;
      if (!canvas) return null;
      // 临时取消选中以获得干净的画面
      canvas.discardActiveObject();
      canvas.renderAll();
      const dataUrl = canvas.toDataURL({
        format: (options?.format || "png") as "png" | "jpeg" | "webp",
        quality: options?.quality || 1,
        multiplier: options?.multiplier || 1,
      });
      return dataUrl;
    },
  }), [applyScale, calcFitScale, onBackgroundChange]);


  // 初始化 Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
      // 选择框样式
      selectionColor: "transparent",
      selectionBorderColor: "#3b82f6",
      selectionLineWidth: 1,
      selectionDashArray: [4, 4],
    });

    fabricRef.current = canvas;

    // 全局设置控制点默认样式（Fabric.js 6.x）
    fabric.Object.prototype.set({
      cornerColor: "#ffffff",
      cornerStrokeColor: "#3b82f6",
      cornerSize: 10,
      cornerStyle: "rect",
      transparentCorners: false,
      borderColor: "#3b82f6",
      borderScaleFactor: 1.5,
      padding: 4,
    });

    canvas.on("selection:created", () => {
      const active = canvas.getActiveObject();
      if (active) {
        const elementId = active.get("elementId");
        const el = elementsRef.current.find((el) => el.id === elementId);
        onSelect(el || null);
      }
    });

    canvas.on("selection:updated", () => {
      const active = canvas.getActiveObject();
      if (active) {
        const elementId = active.get("elementId");
        const el = elementsRef.current.find((el) => el.id === elementId);
        onSelect(el || null);
      }
    });

    canvas.on("selection:cleared", () => {
      onSelect(null);
    });

    canvas.on("object:modified", () => {
      if (isUpdatingRef.current) return;

      const obj = canvas.getActiveObject();
      if (!obj) return;

      const elementId = obj.get("elementId");
      if (!elementId || elementId === "__background__") return;

      const currentScaleX = obj.scaleX || 1;
      const currentScaleY = obj.scaleY || 1;
      const newWidth = (obj.width || 100) * currentScaleX;
      const newHeight = (obj.height || 100) * currentScaleY;

      isUpdatingRef.current = true;
      const updatedElements = elementsRef.current.map((el) => {
        if (el.id === elementId) {
          return {
            ...el,
            x: obj.left || 0,
            y: obj.top || 0,
            width: newWidth,
            height: newHeight,
            rotation: obj.angle || 0,
          };
        }
        return el;
      });
      onChangeRef.current(updatedElements);

      obj.set({
        scaleX: 1,
        scaleY: 1,
        width: newWidth,
        height: newHeight,
      });

      // 同步更新 clipPath 尺寸和位置
      if ((obj as fabric.FabricImage).clipPath) {
        const clipRect = (obj as fabric.FabricImage).clipPath as fabric.Rect;
        clipRect.set({
          left: newWidth / 2,
          top: newHeight / 2,
          width: newWidth,
          height: newHeight,
          originX: "center",
          originY: "center",
        });
      }

      obj.setCoords();
      canvas.renderAll();

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // 同步背景
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (canvasBackground && canvasBackground.startsWith("data:image")) {
      const existingBg = canvas.getObjects().find(
        (o) => o.get("elementId") === "__background__"
      );
      if (existingBg) canvas.remove(existingBg);

      fabric.FabricImage.fromURL(canvasBackground, {
        crossOrigin: "anonymous",
      }).then((img) => {
        if (!fabricRef.current) return;
        const c = fabricRef.current;
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          scaleX: width / (img.width || width),
          scaleY: height / (img.height || height),
        });
        img.set("elementId", "__background__");
        c.add(img);
        c.sendObjectToBack(img);
        c.renderAll();
      }).catch((err) => {
        console.error("背景图片加载失败:", err);
        canvas.backgroundColor = "#ffffff";
        canvas.renderAll();
      });
    } else {
      canvas.backgroundColor = "#ffffff";
      const existingBg = canvas.getObjects().find(
        (o) => o.get("elementId") === "__background__"
      );
      if (existingBg) canvas.remove(existingBg);
      canvas.renderAll();
    }
  }, [canvasBackground, width, height]);

  // 同步元素 - 增量更新
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || isUpdatingRef.current) return;

    const currentIds = new Set(elements.map((el) => el.id));

    const toRemove: fabric.Object[] = [];
    canvas.getObjects().forEach((obj) => {
      const id = obj.get("elementId");
      if (id && id !== "__background__" && !currentIds.has(id)) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((obj) => {
      canvas.remove(obj);
      elementsMapRef.current.delete(obj.get("elementId") as string);
    });

    elements.forEach((element) => {
      if (!element.id) return;

      const existing = elementsMapRef.current.get(element.id);
      if (existing) {
        let needsUpdate = false;

        // 位置
        if (
          Math.abs(existing.left! - element.x) > 1 ||
          Math.abs(existing.top! - element.y) > 1
        ) {
          existing.set({ left: element.x, top: element.y });
          existing.setCoords();
          needsUpdate = true;
        }

        // 尺寸（仅对非文本对象）
        if (element.type !== "text") {
          if (
            Math.abs(existing.width! * (existing.scaleX || 1) - element.width) > 1 ||
            Math.abs(existing.height! * (existing.scaleY || 1) - element.height) > 1
          ) {
            existing.set({
              scaleX: element.width / (existing.width || element.width),
              scaleY: element.height / (existing.height || element.height),
            });
            // 同步更新 clipPath 尺寸和位置
            if (element.type === "image" && (existing as fabric.FabricImage).clipPath) {
              const clipRect = (existing as fabric.FabricImage).clipPath as fabric.Rect;
              clipRect.set({
                left: element.width / 2,
                top: element.height / 2,
                width: element.width,
                height: element.height,
                originX: "center",
                originY: "center",
              });
            }
            needsUpdate = true;
          }
        }

        // 文本属性
        if (existing.type === "i-text" || existing.type === "text") {
          const textObj = existing as fabric.IText;
          if (textObj.text !== (element.content || "")) {
            textObj.set("text", element.content || "");
            needsUpdate = true;
          }
          if ((existing as fabric.IText).fontFamily !== (element.font_family || "sans-serif")) {
            (existing as fabric.IText).set("fontFamily", element.font_family || "sans-serif");
            needsUpdate = true;
          }
          if ((existing as fabric.IText).fontSize !== (element.font_size || 24)) {
            (existing as fabric.IText).set("fontSize", element.font_size || 24);
            needsUpdate = true;
          }
          if (existing.fill !== (element.font_color || "#000000")) {
            existing.set("fill", element.font_color || "#000000");
            needsUpdate = true;
          }
          if ((existing as fabric.IText).textAlign !== (element.text_align || "left")) {
            (existing as fabric.IText).set("textAlign", element.text_align || "left");
            needsUpdate = true;
          }
        }

        // 旋转
        if (element.rotation !== undefined && existing.angle !== element.rotation) {
          existing.set("angle", element.rotation);
          needsUpdate = true;
        }

        // 透明度
        if (element.opacity !== undefined && existing.opacity !== element.opacity) {
          existing.set("opacity", element.opacity);
          needsUpdate = true;
        }

        // 锁定状态
        const shouldBeSelectable = !element.lock;
        if (existing.selectable !== shouldBeSelectable || existing.evented !== shouldBeSelectable) {
          existing.set({
            selectable: shouldBeSelectable,
            evented: shouldBeSelectable,
          });
          needsUpdate = true;
        }

        // 可见性
        const shouldBeVisible = element.visible !== false;
        if (existing.visible !== shouldBeVisible) {
          existing.set("visible", shouldBeVisible);
          needsUpdate = true;
        }

        // 图片：检查是否需要更新图片源
        if (element.type === "image" && element.src && element.src.startsWith("data:")) {
          const isFabricImage = existing.type === "image" || (existing as fabric.FabricImage).setElement;
          if (!isFabricImage) {
            // 当前对象不是 FabricImage，需要替换
            canvas.remove(existing);
            fabric.FabricImage.fromURL(element.src, { crossOrigin: "anonymous" }).then(
              (img) => {
                if (!fabricRef.current) return;
                const targetWidth = element.width || 100;
                const targetHeight = element.height || 100;
                img.set({
                  left: element.x,
                  top: element.y,
                  scaleX: targetWidth / (img.width || 100),
                  scaleY: targetHeight / (img.height || 100),
                  angle: element.rotation || 0,
                  opacity: element.opacity || 1,
                  selectable: !element.lock,
                  evented: !element.lock,
                  hasControls: true,
                  hasBorders: true,
                  lockUniScaling: false,
                  visible: element.visible !== false,
                });
                // 设置圆角
                const borderRadius = element.border_radius || 0;
                if (borderRadius > 0) {
                  const clipRect = new fabric.Rect({
                    left: targetWidth / 2,
                    top: targetHeight / 2,
                    width: targetWidth,
                    height: targetHeight,
                    rx: borderRadius,
                    ry: borderRadius,
                    originX: "center",
                    originY: "center",
                  });
                  img.set("clipPath", clipRect);
                }
                img.set("elementId", element.id);
                img.set("name", element.name);
                fabricRef.current!.add(img);
                if (element.id) {
                  elementsMapRef.current.set(element.id, img);
                }
                fabricRef.current!.renderAll();
              }
            ).catch(console.error);
            return; // 跳过后续更新
          }
          
          // 更新圆角
          const currentRadius = (existing as fabric.FabricImage).clipPath 
            ? ((existing as fabric.FabricImage).clipPath as fabric.Rect).rx || 0 
            : 0;
          const targetRadius = element.border_radius || 0;
          if (currentRadius !== targetRadius) {
            // clipPath 尺寸需要与图片实际显示尺寸一致
            const actualWidth = (element.width || 100) * (existing.scaleX || 1);
            const actualHeight = (element.height || 100) * (existing.scaleY || 1);
            if (targetRadius > 0) {
              const clipRect = new fabric.Rect({
                left: actualWidth / 2,
                top: actualHeight / 2,
                width: actualWidth,
                height: actualHeight,
                rx: targetRadius,
                ry: targetRadius,
                originX: "center",
                originY: "center",
              });
              (existing as fabric.FabricImage).set("clipPath", clipRect);
            } else {
              (existing as fabric.FabricImage).set("clipPath", null);
            }
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          existing.setCoords();
        }
      } else {
        const obj = createFabricObject(canvas, element);
        if (obj) {
          elementsMapRef.current.set(element.id, obj);
        }
      }
    });

    // 处理 z_index 层级排序
    const sortableObjects = canvas.getObjects().filter(
      (o) => o.get("elementId") && o.get("elementId") !== "__background__"
    );
    // 按 z_index 从小到大排序（Fabric.js 索引越小越底层）
    sortableObjects.sort((a, b) => {
      const aEl = elements.find((el) => el.id === a.get("elementId"));
      const bEl = elements.find((el) => el.id === b.get("elementId"));
      return (aEl?.z_index || 0) - (bEl?.z_index || 0);
    });
    sortableObjects.forEach((obj, index) => {
      canvas.moveObjectTo(obj, index);
    });

    canvas.renderAll();
  }, [elements]); // eslint-disable-line react-hooks/exhaustive-deps

  // 更新选中元素
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();

    if (selectedElement) {
      const obj = canvas.getObjects().find(
        (o) => o.get("elementId") === selectedElement.id
      );
      if (obj) canvas.setActiveObject(obj);
    }

    canvas.renderAll();
  }, [selectedElement]);


  // 创建 Fabric 对象
  const createFabricObject = (
    canvas: fabric.Canvas,
    element: TemplateElement
  ): fabric.Object | null => {
    let obj: fabric.Object | null = null;

    switch (element.type) {
      case "text": {
        obj = new fabric.IText(element.content || "双击编辑", {
          left: element.x,
          top: element.y,
          fontSize: element.font_size || 24,
          fontFamily: element.font_family || "sans-serif",
          fill: element.font_color || "#000000",
          textAlign: element.text_align || "left",
          angle: element.rotation || 0,
          opacity: element.opacity || 1,
        });
        break;
      }
      case "image": {
        const src = element.src;
        if (src && src.startsWith("data:")) {
          // 异步创建图片时，直接返回 null，由异步回调处理完整创建
          fabric.FabricImage.fromURL(src, { crossOrigin: "anonymous" }).then(
            (img) => {
              if (!fabricRef.current) return;
              const targetWidth = element.width || 100;
              const targetHeight = element.height || 100;
              const borderRadius = element.border_radius || 0;
              
              img.set({
                left: element.x,
                top: element.y,
                scaleX: targetWidth / (img.width || 100),
                scaleY: targetHeight / (img.height || 100),
                angle: element.rotation || 0,
                opacity: element.opacity || 1,
                // 确保图片可缩放
                selectable: !element.lock,
                evented: !element.lock,
                hasControls: true,
                hasBorders: true,
                lockUniScaling: false,
              });
              
              // 设置圆角（使用 clipPath）
              if (borderRadius > 0) {
                const clipRect = new fabric.Rect({
                  left: targetWidth / 2,
                  top: targetHeight / 2,
                  width: targetWidth,
                  height: targetHeight,
                  rx: borderRadius,
                  ry: borderRadius,
                  originX: "center",
                  originY: "center",
                });
                img.set("clipPath", clipRect);
              }
              
              img.set("elementId", element.id);
              img.set("name", element.name);
              img.set("visible", element.visible !== false);
              fabricRef.current.add(img);
              fabricRef.current.setActiveObject(img);
              fabricRef.current.renderAll();
            }
          ).catch(console.error);
          // 返回 null，因为图片是异步创建的
          return null;
        } else if (!src) {
          obj = new fabric.Rect({
            left: element.x,
            top: element.y,
            width: element.width || 100,
            height: element.height || 100,
            fill: "#f3f4f6",
            stroke: "#d1d5db",
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            // 确保占位符可缩放
            hasControls: true,
            hasBorders: true,
            lockUniScaling: false,
          });
        }
        break;
      }
    }

    if (obj) {
      obj.set("elementId", element.id);
      obj.set("name", element.name);
      // 设置锁定状态
      obj.set({
        selectable: !element.lock,
        evented: !element.lock,
      });
      // 设置可见性
      obj.set("visible", element.visible !== false);
      canvas.add(obj);
      // 根据 z_index 调整层级（使用 elementsRef 确保获取最新数据）
      if (element.z_index !== undefined) {
        const currentElements = elementsRef.current;
        const objects = canvas.getObjects().filter(o => o.get("elementId") && o.get("elementId") !== "__background__");
        objects.sort((a, b) => {
          const aEl = currentElements.find(el => el.id === a.get("elementId"));
          const bEl = currentElements.find(el => el.id === b.get("elementId"));
          return (aEl?.z_index || 0) - (bEl?.z_index || 0);
        });
        objects.forEach((o, i) => {
          canvas.moveObjectTo(o, i);
        });
      }
    }

    return obj;
  };


  // 处理元素拖放
  const handleElementDrop = useCallback(
    (elementType: TemplateElement["type"]) => {
      try {
        const canvas = fabricRef.current;
        if (!canvas) {
          console.error("Canvas not initialized");
          return;
        }

        if (!["text", "image"].includes(elementType)) {
          console.error("Invalid element type:", elementType);
          return;
        }

        const newElement = createElement(elementType, {
          x: width / 2 - 50,
          y: height / 2 - 25,
        });

        if (!newElement.id) {
          console.error("Failed to generate element id");
          return;
        }

        const obj = createFabricObject(canvas, newElement);
        if (obj) {
          elementsMapRef.current.set(newElement.id, obj);
          canvas.setActiveObject(obj);
          canvas.renderAll();
        }

        // 先更新 elementsRef，确保同步逻辑拿到最新数据
        elementsRef.current = [...elementsRef.current, newElement];
        onChange([...elementsRef.current]);
        onSelect(newElement);
      } catch (error) {
        console.error("Error in handleElementDrop:", error);
      }
    },
    [width, height, onChange, onSelect] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // 处理背景图片
  const handleBackgroundImage = useCallback(
    (dataUrl: string) => {
      setCanvasBackground(dataUrl);
      onBackgroundChange?.(dataUrl);
    },
    [onBackgroundChange]
  );

  // 处理文件选择
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        handleBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [handleBackgroundImage]
  );

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-8 bg-gray-100">
      <div
        ref={wrapperRef}
        className="relative mx-auto shadow-xl"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer!.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (event) => {
                handleBackgroundImage(event.target?.result as string);
              };
              reader.readAsDataURL(file);
              return;
            }
          }

          const elementType = e.dataTransfer?.getData("elementType") as TemplateElement["type"];
          if (elementType) handleElementDrop(elementType);
        }}
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <canvas ref={canvasRef} />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="bg-image-upload"
          onChange={handleImageSelect}
        />
      </div>
    </div>
  );
});
