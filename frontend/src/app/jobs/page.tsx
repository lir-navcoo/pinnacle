"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RenderJob } from "@/lib/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据
    setTimeout(() => {
      setJobs([
        {
          id: "job1",
          template_id: "1",
          params: { username: "张三", score: 9527, rank: 1 },
          status: "completed",
          image_url: "https://picsum.photos/750/1334",
          dingtalk_msg_id: "msg123",
          created_at: "2024-01-20T14:30:00Z",
          completed_at: "2024-01-20T14:30:05Z",
        },
        {
          id: "job2",
          template_id: "1",
          params: { username: "李四", score: 8500, rank: 2 },
          status: "completed",
          image_url: "https://picsum.photos/750/1334",
          created_at: "2024-01-20T14:00:00Z",
          completed_at: "2024-01-20T14:00:03Z",
        },
        {
          id: "job3",
          template_id: "2",
          params: { username: "王五", score: 7200, rank: 5 },
          status: "failed",
          error_message: "模板未发布",
          created_at: "2024-01-20T13:00:00Z",
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
            <span className="font-medium">发送记录</span>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="总调用量" value="1,567" change="+12%" />
          <StatCard title="成功" value="1,523" change="97.2%" />
          <StatCard title="失败" value="44" change="2.8%" />
          <StatCard title="今日" value="89" change="+5%" />
        </div>

        {/* 记录列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    任务 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    模板
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    参数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {job.id.slice(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.template_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {JSON.stringify(job.params).slice(0, 30)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : job.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {job.status === "completed"
                          ? "成功"
                          : job.status === "failed"
                          ? "失败"
                          : "处理中"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {job.image_url && (
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-green-600 mt-1">{change}</div>
    </div>
  );
}
