# Core Memory - Pinnacle 战报配置平台

## 项目概述
- 项目中文名：里程碑，英文名：Pinnacle
- 项目类型：企业级战报图片配置与分发平台
- 核心功能：可视化配置战报模板 → 开放API供三方调用传入参数 → 渲染合成图片 → 钉钉机器人自动推送

## 技术栈决策
- 前端框架：Next.js 14 + React 18 + shadcn/ui + Tailwind CSS
- 画布/拖拽：Fabric.js（可视化编辑器核心）
- 表单/验证：react-hook-form + zod
- 状态管理：Zustand / React Query
- 后端API：FastAPI (Python)
- 图片渲染：Pillow (Python)（渲染引擎必须用Python）
- 消息推送：钉钉机器人 Webhook
- 数据库：PostgreSQL + Prisma
- 缓存：Redis
- 对象存储：阿里云 OSS / S3

## 项目模块
- 模板配置模块（可视化编辑器，基于Fabric.js）
- API管理模块（密钥管理、调用日志、配额限制）
- 渲染引擎模块（模板解析、图片合成）
- 分发推送模块（钉钉机器人配置）
- 数据统计模块（调用量、成功率）

## 当前进度
- 已完成架构设计、技术选型确认、前端拖拽方案设计
- 下一步：项目初始化（Next.js + shadcn/ui 或 FastAPI 基础结构）
