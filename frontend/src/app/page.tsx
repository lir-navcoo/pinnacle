import Link from "next/link";
import { 
  Layers, 
  Code2, 
  Send, 
  BarChart3, 
  ArrowRight,
  Plus,
  Image,
  Key,
  MessageSquare
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Pinnacle</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900">
              模板管理
            </Link>
            <Link href="/api-keys" className="text-sm text-gray-600 hover:text-gray-900">
              API Keys
            </Link>
            <Link href="/dingtalk" className="text-sm text-gray-600 hover:text-gray-900">
              钉钉配置
            </Link>
            <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900">
              发送记录
            </Link>
          </nav>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero 区域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            战报配置平台
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            可视化配置战报模板，三方系统 API 调用渲染，
            <br />
            一键发送到钉钉群
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/templates/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              创建模板
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              API 文档
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Layers className="w-6 h-6" />}
            title="可视化编辑"
            description="拖拽式画布，实时预览，预设组件库"
            color="blue"
          />
          <FeatureCard
            icon={<Code2 className="w-6 h-6" />}
            title="API 开放"
            description="三方系统调用，传入参数生成图片"
            color="green"
          />
          <FeatureCard
            icon={<Send className="w-6 h-6" />}
            title="钉钉推送"
            description="集成机器人，自动发送到群聊"
            color="orange"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="数据统计"
            description="调用量、成功率实时监控"
            color="purple"
          />
        </div>

        {/* 快速开始 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">快速开始</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="创建模板"
              description="在画布上拖拽添加文本、图片等元素，配置样式和绑定字段"
            />
            <StepCard
              number={2}
              title="获取 API Key"
              description="在设置页面创建 API Key，设置访问权限"
            />
            <StepCard
              number={3}
              title="三方调用"
              description="使用 API Key 调用接口，传入参数获取战报图片"
            />
          </div>
        </div>

        {/* API 示例 */}
        <div className="bg-gray-900 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">API 调用示例</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">请求</h3>
              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
{`POST /api/v1/render
Headers:
  X-API-Key: pkl_xxxx

{
  "template_id": "tpl_abc123",
  "params": {
    "username": "张三",
    "score": 9527,
    "rank": 1,
    "avatar_url": "https://example.com/avatar.png"
  },
  "send_dingtalk": true
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">响应</h3>
              <pre className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto">
{`{
  "job_id": "job_xyz789",
  "image_url": "https://cdn.example.com/battle_report.png",
  "status": "completed",
  "dingtalk_msg_id": "msg123"
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            © 2024 Pinnacle. 企业级战报配置平台
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/docs" className="hover:text-gray-900">API 文档</Link>
            <Link href="/settings" className="hover:text-gray-900">设置</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
