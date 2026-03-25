"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Copy, Trash2, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { APIKey } from "@/lib/api";

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  useEffect(() => {
    // 模拟数据
    setTimeout(() => {
      setApiKeys([
        {
          id: "1",
          name: "生产环境 Key",
          prefix: "pkl_abc1",
          permissions: ["render", "preview"],
          rate_limit: 100,
          template_ids: ["1", "2"],
          is_active: true,
          call_count: 1520,
          last_used_at: "2024-01-20T14:30:00Z",
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          name: "测试环境 Key",
          prefix: "pkl_def2",
          permissions: ["render"],
          rate_limit: 50,
          template_ids: ["1"],
          is_active: true,
          call_count: 45,
          created_at: "2024-01-18T09:00:00Z",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
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
            <span className="font-medium">API Keys</span>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            创建 Key
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-1">API Key 使用说明</h3>
          <p className="text-sm text-blue-700">
            请将 API Key 妥善保存，仅在服务端使用，切勿暴露在前端代码或公开仓库中。
            调用时在 Header 中添加 <code className="bg-blue-100 px-1 rounded">X-API-Key: your-key</code>
          </p>
        </div>

        {/* 列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {apiKey.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          apiKey.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {apiKey.is_active ? "启用" : "禁用"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>前缀: <code className="bg-gray-100 px-1 rounded">{apiKey.prefix}_***</code></span>
                      <span>限流: {apiKey.rate_limit}/min</span>
                      <span>调用: {apiKey.call_count} 次</span>
                      {apiKey.last_used_at && (
                        <span>最后使用: {new Date(apiKey.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Check className="w-4 h-4 mr-1" />
                      查看完整 Key
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {showNewKey === apiKey.id && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      ⚠️ 此 Key 仅显示一次，请妥善保存！
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border">
                        {apiKey.prefix}_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                      </code>
                      <Button
                        size="sm"
                        onClick={() => copyKey(`${apiKey.prefix}_xxx`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
