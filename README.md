# Pinnacle - 可视化模板编辑平台

> 企业级可视化模板配置与图片生成平台

## 🎯 项目介绍

Pinnacle（顶峰）是一个可视化模板编辑平台，支持：

- 🎨 **可视化编辑**：Fabric.js 画布，支持文本和图片组件
- 📤 **模板管理**：创建、编辑、发布、预览模板
- 🖼️ **图片生成**：将模板渲染为指定尺寸的图片
- 📡 **API 开放**：第三方系统调用 API 传入参数生成图片

## 🛠️ 技术栈

### 前端

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Fabric.js（可视化编辑器）
- Sonner（操作提示）

### 后端

- Python FastAPI
- SQLAlchemy（异步）+ SQLite
- Pydantic（数据验证）
- Uvicorn（ASGI 服务器）

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- pnpm（前端包管理器）

### 后端

```bash
cd backend

# 创建虚拟环境
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
uv sync

# 启动服务
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 前端

```bash
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

## 📁 项目结构

```
pinnacle/
├── backend/              # Python FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py      # 应用入口
│   │   ├── api/         # API 路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   ├── schemas/     # Pydantic Schema
│   │   └── services/    # 业务服务
│   ├── tests/
│   ├── pyproject.toml
│   └── requirements.txt
│
├── frontend/             # Next.js 前端
│   ├── src/
│   │   ├── app/         # 页面路由
│   │   ├── components/   # React 组件
│   │   │   └── editor/  # 编辑器组件
│   │   ├── lib/         # 工具库和 API
│   │   └── types/       # TypeScript 类型
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 📖 主要功能

### 模板管理

- 创建新模板，设置画布尺寸（预设或自定义）
- 编辑现有模板，添加/修改/删除元素
- 预览模板效果
- 发布模板

### 编辑器

- **画布操作**：缩放、平移、预览
- **元素操作**：
  - 添加文本（支持双击编辑）
  - 添加图片（支持裁剪、圆角）
  - 选中、拖拽、缩放、旋转
  - 锁定/解锁图层
  - 显示/隐藏图层
  - 层级调整
- **属性面板**：修改选中元素的样式属性

### 图层系统

- 左侧图层列表显示所有元素
- 支持拖拽排序
- 锁定、隐藏操作
- 点击选中图层

## 📖 API 文档

启动后端服务后访问：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 模板接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/templates` | 获取模板列表 |
| POST | `/api/v1/templates` | 创建模板 |
| GET | `/api/v1/templates/{id}` | 获取模板详情 |
| PUT | `/api/v1/templates/{id}` | 更新模板 |
| DELETE | `/api/v1/templates/{id}` | 删除模板 |
| POST | `/api/v1/templates/{id}/publish` | 发布模板 |

### 渲染接口

```bash
POST /api/v1/render
Headers:
  Content-Type: application/json

Body:
{
  "template_id": "template-uuid",
  "params": {
    "field_name": "value"
  }
}
```

### 模板变量语法

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

## 🔧 开发说明

### 数据库

使用 SQLite 数据库，文件位于 `backend/pinnacle.db`。

首次启动后端服务时，数据库会自动创建并初始化。

### 组件开发

编辑器使用 Fabric.js 进行画布渲染，核心组件：

- `Canvas.tsx` - 画布编辑器主组件
- `EditorPage.tsx` - 编辑页面容器
- `Toolbar.tsx` - 工具栏
- `Layers.tsx` - 图层面板
- `Properties.tsx` - 属性面板

### 图片圆角

图片圆角使用 Fabric.js `clipPath` 实现，需正确设置中心定位：

```typescript
const clipRect = new fabric.Rect({
  left: width / 2,
  top: height / 2,
  width,
  height,
  rx: borderRadius,
  ry: borderRadius,
  originX: "center",
  originY: "center",
});
img.set("clipPath", clipRect);
```

### 层级排序

Fabric.js 6.x 使用 `canvas.moveObjectTo(object, index)` 调整层级。

## 📝 许可证

MIT License
