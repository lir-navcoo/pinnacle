# Pinnacle Backend

战报配置平台后端服务

## 技术栈

- **FastAPI** - 高性能 Python Web 框架
- **SQLAlchemy** - ORM (异步支持)
- **PostgreSQL** - 关系型数据库
- **Redis** - 缓存和消息队列
- **Pillow** - 图片渲染引擎
- **阿里云 OSS** - 对象存储

## 快速开始

### 1. 安装依赖

```bash
cd backend
uv sync
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 配置数据库等信息
```

### 3. 启动服务

```bash
# 开发模式
uv run uvicorn app.main:app --reload --port 8000

# 生产模式
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── api/              # API 路由
│   │   └── v1/
│   │       └── endpoints/ # 各模块端点
│   ├── core/             # 核心配置
│   ├── models/           # 数据模型
│   ├── schemas/          # Pydantic Schema
│   ├── services/         # 业务服务
│   └── main.py          # 应用入口
├── tests/                # 测试
└── uploads/             # 上传文件目录
```

## API 文档

### 模板管理

- `GET /api/v1/templates` - 获取模板列表
- `POST /api/v1/templates` - 创建模板
- `GET /api/v1/templates/{id}` - 获取模板详情
- `PUT /api/v1/templates/{id}` - 更新模板
- `DELETE /api/v1/templates/{id}` - 删除模板
- `POST /api/v1/templates/{id}/publish` - 发布模板

### 渲染接口 (三方调用)

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
  "format": "png",
  "send_dingtalk": true
}
```

### API Key 管理

- `GET /api/v1/api-keys` - 获取 Key 列表
- `POST /api/v1/api-keys` - 创建 Key (返回完整 Key)
- `PUT /api/v1/api-keys/{id}` - 更新 Key
- `DELETE /api/v1/api-keys/{id}` - 删除 Key

### 钉钉机器人

- `GET /api/v1/dingtalk/bots` - 获取机器人列表
- `POST /api/v1/dingtalk/bots` - 创建机器人
- `POST /api/v1/dingtalk/bots/{id}/test` - 测试机器人
- `POST /api/v1/dingtalk/send` - 发送消息

## 模板变量语法

在模板文本中使用 `{{field}}` 引用参数：

```
用户名: {{username}}
得分: {{score, thousand}}
排名: 第 {{rank}} 名
```

支持的格式化器：
- `thousand` - 数字千分位 (9527 → 9,527)
- `percent` - 百分比
- `yuan` - 人民币 (100 → ¥100.00)
