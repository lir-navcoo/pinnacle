"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Copy, Trash2, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, Template } from "@/lib/api";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // 获取模板列表
  const fetchTemplates = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    try {
      const response = await api.templates.list({
        page: page,
        page_size: pageSize,
        search: searchQuery || undefined,
      });
      setTemplates(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error("获取模板列表失败:", error);
      toast.error("获取模板列表失败，请稍后重试");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // 初始加载
  useEffect(() => {
    fetchTemplates(search);
  }, [fetchTemplates, search]);

  // 搜索处理（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // 搜索时重置到第一页
      fetchTemplates(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 删除模板
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除模板「${name}」吗？此操作不可恢复。`)) {
      return;
    }
    try {
      await api.templates.delete(id);
      toast.success("模板已删除");
      fetchTemplates(search);
    } catch (error) {
      console.error("删除模板失败:", error);
      toast.error("删除模板失败，请稍后重试");
    }
  };

  // 复制模板
  const handleDuplicate = async (id: string) => {
    try {
      const newTemplate = await api.templates.duplicate(id);
      toast.success(`模板「${newTemplate.name}」已创建`);
      fetchTemplates(search);
    } catch (error) {
      console.error("复制模板失败:", error);
      toast.error("复制模板失败，请稍后重试");
    }
  };

  // 发布模板
  const handlePublish = async (id: string) => {
    try {
      await api.templates.publish(id);
      toast.success("模板已发布");
      fetchTemplates(search);
    } catch (error) {
      console.error("发布模板失败:", error);
      toast.error("发布模板失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Pinnacle</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium">模板管理</span>
          </div>
          <Link href="/templates/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新建模板
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索模板..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchTemplates(search)}
              title="刷新"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {loading ? "加载中..." : `共 ${total} 个模板`}
          </div>
        </div>

        {/* 模板列表 */}
        {loading && templates.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "未找到匹配的模板" : "还没有模板"}
            </h3>
            <p className="text-gray-500 mb-6">
              {search ? "尝试使用其他关键词搜索" : "创建你的第一个战报模板"}
            </p>
            {search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                清除搜索
              </Button>
            ) : (
              <Link href="/templates/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新建模板
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 缩略图 */}
                <Link href={`/templates/${template.id}/edit`}>
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">
                        {template.width} × {template.height}
                      </div>
                    )}
                  </div>
                </Link>

                {/* 信息 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link 
                        href={`/templates/${template.id}/edit`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {template.name}
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {template.description || "暂无描述"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        template.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {template.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      已渲染 {template.render_count} 次
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/templates/${template.id}/edit`}>
                        <Button variant="ghost" size="sm" title="编辑">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="复制"
                        onClick={() => handleDuplicate(template.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {template.status !== "published" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="发布"
                          onClick={() => handlePublish(template.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <span className="text-xs font-medium">发布</span>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="删除"
                        onClick={() => handleDelete(template.id, template.name)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {total > pageSize && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              第 {page} / {Math.ceil(total / pageSize)} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage(p => p + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
