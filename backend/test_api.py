"""测试后端 API"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """测试健康检查"""
    resp = requests.get(f"{BASE_URL}/health")
    print(f"健康检查: {resp.json()}")
    return resp.status_code == 200

def test_list_templates():
    """测试模板列表"""
    resp = requests.get(f"{BASE_URL}/api/v1/templates")
    print(f"模板列表: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"  总数: {data.get('total', 0)}")
        print(f"  模板: {data.get('items', [])}")
    return resp.status_code == 200

def test_create_template():
    """测试创建模板"""
    template_data = {
        "name": "测试模板",
        "width": 750,
        "height": 1334,
        "elements": []
    }
    resp = requests.post(f"{BASE_URL}/api/v1/templates", json=template_data)
    print(f"创建模板: {resp.status_code}")
    if resp.status_code in [200, 201]:
        data = resp.json()
        print(f"  ID: {data.get('id')}")
        print(f"  名称: {data.get('name')}")
        return data.get('id')
    else:
        print(f"  错误: {resp.text}")
    return None

if __name__ == "__main__":
    print("=== 测试后端 API ===\n")
    
    print("1. 健康检查")
    if not test_health():
        print("❌ 健康检查失败")
        exit(1)
    print("✅ 健康检查通过\n")
    
    print("2. 模板列表")
    test_list_templates()
    print()
    
    print("3. 创建模板")
    template_id = test_create_template()
    if template_id:
        print(f"✅ 模板创建成功: {template_id}\n")
    else:
        print("❌ 模板创建失败\n")
