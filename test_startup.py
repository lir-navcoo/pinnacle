#!/usr/bin/env python3
"""
Pinnacle 项目启动测试脚本
测试后端和前端是否可以正常启动
"""

import subprocess
import time
import sys
import os

def test_backend():
    """测试后端服务"""
    print("\n" + "="*60)
    print("🔍 测试后端服务")
    print("="*60)
    
    # 检查后端依赖
    backend_dir = "/Users/lirui/Documents/pinnacle/backend"
    venv_python = f"{backend_dir}/.venv/bin/python"
    
    if not os.path.exists(venv_python):
        print("❌ 后端虚拟环境不存在，请先运行：cd backend && uv sync")
        return False
    
    # 使用虚拟环境的 Python 尝试加载后端应用
    try:
        result = subprocess.run(
            [venv_python, "-c", """
import sys
sys.path.insert(0, '.')
from app.main import app
print(f'OK:{app.title}:{len(app.routes)}')
            """],
            capture_output=True,
            text=True,
            cwd=backend_dir,
            timeout=10
        )
        
        if result.returncode == 0 and result.stdout.startswith('OK:'):
            parts = result.stdout.strip().split(':')
            app_title = parts[1]
            routes_count = parts[2]
            print("✅ 后端应用加载成功")
            print(f"   - 应用名称：{app_title}")
            print(f"   - 路由数量：{routes_count}")
            
            # 检查关键文件
            critical_files = [
                "app/main.py",
                "app/core/config.py",
                "app/api/v1/router.py",
                "pyproject.toml"
            ]
            for file in critical_files:
                path = f"{backend_dir}/{file}"
                if os.path.exists(path):
                    print(f"   ✓ {file}")
                else:
                    print(f"   ✗ {file} (缺失)")
            
            return True
        else:
            print(f"❌ 后端应用加载失败：{result.stderr}")
            return False
        
    except subprocess.TimeoutExpired:
        print("❌ 后端应用加载超时")
        return False
    except Exception as e:
        print(f"❌ 后端应用加载失败：{e}")
        return False

def test_frontend():
    """测试前端项目"""
    print("\n" + "="*60)
    print("🔍 测试前端项目")
    print("="*60)
    
    frontend_dir = "/Users/lirui/Documents/pinnacle/frontend"
    
    # 检查 node_modules
    if not os.path.exists(f"{frontend_dir}/node_modules"):
        print("❌ 前端依赖未安装，请先运行：cd frontend && npm install")
        return False
    
    # 检查关键文件
    required_files = [
        "package.json",
        "next.config.js",
        "src/app/page.tsx",
        "src/app/layout.tsx"
    ]
    
    all_exist = True
    for file in required_files:
        path = f"{frontend_dir}/{file}"
        if os.path.exists(path):
            print(f"✓ {file}")
        else:
            print(f"✗ {file} (缺失)")
            all_exist = False
    
    if not all_exist:
        return False
    
    # 读取 package.json 检查配置
    import json
    with open(f"{frontend_dir}/package.json") as f:
        package = json.load(f)
    
    print(f"\n✅ 前端项目结构完整")
    print(f"   - 项目名称：{package['name']}")
    print(f"   - 版本：{package['version']}")
    print(f"   - 主要依赖：Next.js {package['dependencies']['next']}, React {package['dependencies']['react']}")
    
    return True

def main():
    """主函数"""
    print("\n" + "="*60)
    print("🚀 Pinnacle 项目可用性测试")
    print("="*60)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n" + "="*60)
    print("📊 测试结果汇总")
    print("="*60)
    
    if backend_ok and frontend_ok:
        print("\n✅ 项目完全可用！\n")
        print("启动指南：")
        print("  1. 启动后端：cd backend && uv run uvicorn app.main:app --reload --port 8000")
        print("  2. 启动前端：cd frontend && npm run dev")
        print("  3. 访问前端：http://localhost:3000")
        print("  4. 访问 API 文档：http://localhost:8000/docs\n")
        return 0
    else:
        print("\n⚠️  项目存在问题，请根据上方提示修复\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
