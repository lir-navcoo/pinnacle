# Pinnacle - 战报配置平台

> 企业级战报图片配置与分发平台

## 🎯 项目介绍

Pinnacle（里程碑）是一个可视化战报配置平台，支持：

- 🎨 **可视化编辑**：拖拽式画布，预设组件库
- 📡 **API 开放**：三方系统调用，传入参数生成图片
- 📤 **钉钉推送**：集成机器人，自动发送到群聊
- 📊 **数据统计**：调用量、成功率实时监控

## 🛠️ 技术栈

### 前端
- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Fabric.js（可视化编辑器）

### 后端
- Python FastAPI
- SQLAlchemy（异步）
- PostgreSQL
- Redis
- Pillow（图片渲染）
- 阿里云 OSS

## 🚀 快速开始

### 后端

```bash
cd backend

# 安装依赖
uv sync

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库等信息

# 启动服务
uv run uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
pinnacle/
├── backend/              # Python FastAPI 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   ├── schemas/      # Pydantic Schema
│   │   └── services/     # 业务服务
│   ├── tests/
│   └── pyproject.toml
│
├── frontend/             # Next.js 前端
│   ├── src/
│   │   ├── app/         # 页面
│   │   ├── components/   # 组件
│   │   ├── lib/         # 工具库
│   │   └── types/       # 类型定义
│   └── package.json
│
└── README.md
```

## 📖 API 文档

启动后端服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 渲染接口（第三方调用）

```bash
POST /api/v1/render
Headers:
  X-API-Key: your-api-key

Body:
{
  "template_id": "template-uuid",
  "params": {
    "username": "张三",
    "score": 9527,
    "rank": 1
  },
  "send_dingtalk": true
}
```

## 🔧 模板变量语法

在文本元素中使用 `{{variable}}` 引用参数：

```
用户名: {{username}}
得分: {{score, thousand}}  # 千分位格式化
排名: 第 {{rank}} 名
```

支持的格式化器：
- `thousand` - 数字千分位
- `percent` - 百分比  
- `yuan` - 人民币

## 📝 许可证

MIT License
