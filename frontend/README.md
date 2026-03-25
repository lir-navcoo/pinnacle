# Pinnacle Frontend

战报配置平台前端

## 技术栈

- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **shadcn/ui** - UI 组件
- **Fabric.js** - Canvas 画布（可视化编辑器）
- **Zustand** - 状态管理
- **React Query** - 数据获取

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问

- 首页: http://localhost:3000
- 模板管理: http://localhost:3000/templates
- API Keys: http://localhost:3000/api-keys
- 钉钉配置: http://localhost:3000/dingtalk
- 发送记录: http://localhost:3000/jobs

## 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── templates/          # 模板管理页面
│   │   ├── api-keys/           # API Key 管理
│   │   ├── dingtalk/           # 钉钉配置
│   │   ├── jobs/               # 发送记录
│   │   └── page.tsx            # 首页
│   ├── components/
│   │   ├── editor/             # 编辑器组件
│   │   │   ├── Canvas.tsx      # Fabric.js 画布
│   │   │   ├── ElementPalette.tsx  # 元素面板
│   │   │   ├── PropertyPanel.tsx   # 属性面板
│   │   │   └── EditorPage.tsx      # 编辑器页面
│   │   └── ui/                 # UI 组件
│   ├── lib/
│   │   ├── api.ts              # API 客户端
│   │   └── utils.ts             # 工具函数
│   ├── hooks/                  # 自定义 Hooks
│   ├── stores/                # Zustand 状态
│   └── types/                 # TypeScript 类型
└── public/
```

## 主要功能

### 可视化编辑器

- 拖拽添加元素（文本、图片、形状、图表）
- 选中元素后可在右侧属性面板配置
- 支持元素移动、缩放、旋转
- 实时预览

### 模板变量

在文本元素中使用 `{{variable}}` 语法定义变量：

```
用户名: {{username}}
得分: {{score, thousand}}  # 千分位格式化
排名: 第 {{rank}} 名
```

支持的格式化器：
- `thousand` - 数字千分位
- `percent` - 百分比
- `yuan` - 人民币

## 环境变量

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 开发指南

### 添加新组件

1. 在 `src/components/ui/` 下创建组件
2. 使用 shadcn/ui 风格导出
3. 在需要的地方导入使用

### API 调用

使用 `src/lib/api.ts` 中的 API 客户端：

```typescript
import { api } from '@/lib/api';

// 获取模板列表
const { items, total } = await api.templates.list({ page: 1 });

// 渲染图片
const result = await api.render.create({
  template_id: 'xxx',
  params: { username: '张三', score: 9527 },
  send_dingtalk: true,
});
```
