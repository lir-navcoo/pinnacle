# Core Memory - Pinnacle 战报配置平台

## 项目概述
- 项目中文名：里程碑，英文名：Pinnacle
- 项目类型：企业级战报图片配置与分发平台
- 核心功能：可视化配置战报模板 → 开放 API 供三方调用传入参数 → 渲染合成图片 → 钉钉机器人自动推送

## 技术栈决策（已确定）
- 前端：Next.js 15 + React + shadcn/ui + Tailwind CSS（前端端口：3000）
- 后端：FastAPI (Python)，图片渲染：Pillow，消息推送：钉钉机器人 Webhook
- 数据库：MySQL + aiomysql（异步模式），缓存：Redis
- 对象存储：本地文件系统（uploads 目录），支持切换阿里云 OSS
- 依赖管理：uv (Python), npm (前端)

## 服务端口
- 前端端口：3000（默认访问地址：http://localhost:3000）
- 后端端口：8000

## 项目模块
- 模板配置模块（可视化编辑器，基于 Fabric.js 实现拖拉拽）
- API 管理模块（密钥管理、调用日志、配额限制）
- 渲染引擎模块（模板解析、图片合成）
- 分发推送模块（钉钉机器人配置）
- 数据统计模块（调用量、成功率）

## 代码仓库
- GitHub 仓库：git@github.com:li78080114/pinnacle.git（用户 GitHub 用户名：li78080114）

## 当前进度
- ✅ 已完成项目初始化（前后端基础框架）
- ✅ 已推送代码到 Gitee（25个文件，14983 行代码）
- 🔄 当前任务：在 GitHub 创建新仓库并推送代码
