-- Pinnacle 数据库初始化脚本（MySQL）

-- 创建数据库
CREATE DATABASE IF NOT EXISTS pinnacle 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE pinnacle;

-- 说明：
-- 1. 首次运行此脚本创建数据库
-- 2. 后端服务启动时会自动创建表结构（使用 SQLAlchemy ORM）
-- 3. 确保 MySQL 用户有访问权限

-- 示例：创建专用用户（可选）
-- CREATE USER 'pinnacle'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON pinnacle.* TO 'pinnacle'@'localhost';
-- FLUSH PRIVILEGES;
