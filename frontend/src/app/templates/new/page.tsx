"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewTemplatePage() {
  const router = useRouter();

  useEffect(() => {
    // 进入页面时自动创建空白模板，然后跳转到编辑页面
    async function createAndRedirect() {
      try {
        const template = await api.templates.create({
          name: "未命名模板",
          width: 750,
          height: 1334,
          elements: [],
          is_published: false,
        });
        // 跳转到编辑页面
        router.replace(`/templates/${template.id}/edit`);
      } catch (err) {
        console.error("创建模板失败:", err);
        toast.error("创建模板失败");
        router.push("/templates");
      }
    }

    createAndRedirect();
  }, [router]);

  // 显示加载状态
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500">正在创建模板...</p>
      </div>
    </div>
  );
}
