"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, TestTube, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DingTalkBot } from "@/lib/api";

export default function DingTalkPage() {
  const [bots, setBots] = useState<DingTalkBot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据
    setTimeout(() => {
      setBots([
        {
          id: "1",
          name: "销售战报群机器人",
          webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=xxx",
          secret: "secret-xxx",
          description: "用于发送销售部门的日报、周报",
          is_active: true,
          send_count: 152,
          success_count: 148,
          last_used_at: "2024-01-20T14:30:00Z",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T14:30:00Z",
        },
        {
          id: "2",
          name: "运营数据机器人",
          webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=yyy",
          description: "用于发送运营数据报告",
          is_active: true,
          send_count: 45,
          success_count: 44,
          created_at: "2024-01-18T09:00:00Z",
          updated_at: "2024-01-18T09:00:00Z",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const testBot = async (botId: string) => {
    // 模拟测试
    alert("测试消息已发送，请检查钉钉群");
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
            <span className="font-medium">钉钉配置</span>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加机器人
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-1">钉钉机器人配置</h3>
          <p className="text-sm text-blue-700">
            在钉钉群中添加自定义机器人，将 Webhook URL 和 Secret 填入下方。
            机器人消息接收限制：每分钟 20 条。
          </p>
        </div>

        {/* 列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有配置机器人
            </h3>
            <p className="text-gray-500 mb-6">
              添加钉钉群机器人，开始自动发送战报
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加机器人
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {bot.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          bot.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {bot.is_active ? "启用" : "禁用"}
                      </span>
                    </div>
                    {bot.description && (
                      <p className="text-sm text-gray-500">{bot.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testBot(bot.id)}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      测试
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">发送次数</span>
                    <div className="font-medium">{bot.send_count}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">成功率</span>
                    <div className="font-medium">
                      {bot.send_count > 0
                        ? ((bot.success_count / bot.send_count) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">最后使用</span>
                    <div className="font-medium">
                      {bot.last_used_at
                        ? new Date(bot.last_used_at).toLocaleDateString()
                        : "未使用"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">创建时间</span>
                    <div className="font-medium">
                      {new Date(bot.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* 成功率指示器 */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>成功率</span>
                    <span>
                      {bot.send_count > 0
                        ? `${bot.success_count}/${bot.send_count}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          bot.send_count > 0
                            ? (bot.success_count / bot.send_count) * 100
                            : 0
                        }%`,
                      }}
                    />
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
