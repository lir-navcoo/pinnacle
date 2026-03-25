"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit, Copy, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Template } from "@/lib/api";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // 模拟数据
    setTimeout(() => {
      setTemplates([
        {
          id: "1",
          name: "销售战报",
          description: "月度销售业绩战报",
          width: 750,
          height: 1334,
          background_color: "#ffffff",
          elements: [],
          status: "published",
          is_public: false,
          render_count: 1520,
          user_id: "user1",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T14:30:00Z",
        },
        {
          id: "2",
          name: "运营数据报告",
          description: "周度运营数据展示",
          width: 750,
          height: 1334,
          background_color: "#f5f5f5",
          elements: [],
          status: "draft",
          is_public: false,
          render_count: 0,
          user_id: "user1",
          created_at: "2024-01-18T09:00:00Z",
          updated_at: "2024-01-18T09:00:00Z",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

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
          </div>
          <div className="text-sm text-gray-500">
            共 {templates.length} 个模板
          </div>
        </div>

        {/* 模板列表 */}
        {loading ? (
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
              还没有模板
            </h3>
            <p className="text-gray-500 mb-6">
              创建你的第一个战报模板
            </p>
            <Link href="/templates/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建模板
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 缩略图 */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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

                {/* 信息 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {template.description || "暂无描述"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
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
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      已渲染 {template.render_count} 次
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/templates/${template.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
