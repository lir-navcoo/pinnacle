"""测试后端应用是否可以加载"""
import sys

try:
    from app.main import app
    print("✅ Backend app loaded successfully!")
    print(f"   App title: {app.title}")
    print(f"   Routes count: {len(app.routes)}")
    
    # 检查关键路由
    routes = [r.path for r in app.routes if hasattr(r, 'path')]
    print(f"\n   Key routes:")
    for route in ['/health', '/', '/api/v1/templates', '/api/v1/render']:
        status = "✓" if route in routes else "✗"
        print(f"   {status} {route}")
    
except Exception as e:
    print(f"❌ Error loading backend app: {e}")
    sys.exit(1)
