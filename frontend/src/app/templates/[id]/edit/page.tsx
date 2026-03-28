"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EditorPage } from "@/components/editor/EditorPage";
import type { Template } from "@/lib/api";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const templateId = params.id as string;

  useEffect(() => {
    async function fetchTemplate() {
      if (!templateId) return;
      
      try {
        const data = await api.templates.get(templateId);
        setTemplate(data);
      } catch (err) {
        console.error("获取模板失败:", err);
        setError("模板不存在或加载失败");
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [templateId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500">加载模板中...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <p className="text-red-500">{error || "模板不存在"}</p>
          <button
            onClick={() => router.push("/templates")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回模板列表
          </button>
        </div>
      </div>
    );
  }

  return <EditorPage template={template} />;
}
