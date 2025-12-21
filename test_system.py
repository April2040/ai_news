#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI信息聚合平台 - 系统测试脚本
验证真实数据收集和前端集成是否正常工作
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_collector import DataCollector

def test_data_collection():
    """测试数据收集功能"""
    print("🧪 测试数据收集功能...")
    
    async def run_test():
        async with DataCollector() as collector:
            news_items = await collector.collect_all()
            
            if len(news_items) > 0:
                print(f"✅ 成功收集到 {len(news_items)} 条新闻")
                
                # 显示前3条新闻
                for i, news in enumerate(news_items[:3], 1):
                    print(f"  {i}. {news.title}")
                    print(f"     重要性: {news.importance_score:.1f}")
                    print(f"     来源: {news.source}")
                    print()
                
                return True
            else:
                print("❌ 未收集到任何新闻")
                return False
    
    return asyncio.run(run_test())

def test_data_files():
    """测试数据文件"""
    print("🧪 测试数据文件...")
    
    # 查找最新的数据文件
    data_files = list(Path('.').glob('ai_news_*.json'))
    
    if not data_files:
        print("❌ 未找到数据文件")
        return False
    
    latest_file = max(data_files, key=lambda f: f.stat().st_mtime)
    print(f"📁 使用最新数据文件: {latest_file}")
    
    try:
        with open(latest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ 数据文件格式正确，包含 {len(data)} 条新闻")
        
        # 验证数据结构
        required_fields = ['id', 'title', 'summary', 'url', 'source', 'importance_score']
        sample_item = data[0] if data else {}
        
        missing_fields = [field for field in required_fields if field not in sample_item]
        if missing_fields:
            print(f"❌ 数据结构不完整，缺少字段: {missing_fields}")
            return False
        
        print("✅ 数据结构验证通过")
        
        # 显示数据统计
        importance_scores = [item.get('importance_score', 0) for item in data]
        avg_importance = sum(importance_scores) / len(importance_scores)
        high_importance_count = sum(1 for score in importance_scores if score >= 8.0)
        
        print(f"📊 数据统计:")
        print(f"  - 平均重要性: {avg_importance:.1f}")
        print(f"  - 高重要性新闻: {high_importance_count} 条")
        
        # 显示数据源分布
        sources = {}
        for item in data:
            source = item.get('source', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        print(f"📡 数据源分布:")
        for source, count in sources.items():
            print(f"  - {source}: {count} 条")
        
        return True
        
    except Exception as e:
        print(f"❌ 数据文件读取失败: {str(e)}")
        return False

def test_web_files():
    """测试Web文件"""
    print("🧪 测试Web文件...")
    
    required_files = [
        'index_realdata.html',
        'js/realDataLoader.js',
        'js/main_realdata.js',
        'styles/realdata.css'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ 缺少必要文件: {missing_files}")
        return False
    
    print("✅ 所有Web文件存在")
    
    # 检查HTML文件中是否包含真实数据版本的引用
    with open('index_realdata.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    if 'realDataLoader.js' in html_content and 'realdata.css' in html_content:
        print("✅ HTML文件正确引用真实数据版本")
        return True
    else:
        print("❌ HTML文件未正确引用真实数据版本")
        return False

def test_dependencies():
    """测试依赖包"""
    print("🧪 测试依赖包...")
    
    required_packages = ['aiohttp', 'feedparser', 'bs4']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ 缺少依赖包: {missing_packages}")
        return False
    
    print("✅ 所有依赖包已安装")
    return True

def main():
    """主测试函数"""
    print("🚀 AI信息聚合平台 - 系统测试")
    print("=" * 50)
    
    tests = [
        ("依赖包检查", test_dependencies),
        ("数据收集测试", test_data_collection),
        ("数据文件测试", test_data_files),
        ("Web文件测试", test_web_files)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} - 通过")
            else:
                print(f"❌ {test_name} - 失败")
        except Exception as e:
            print(f"💥 {test_name} - 异常: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！系统准备就绪")
        print("\n🚀 启动命令:")
        print("  ./start_realdata.sh")
        print("\n📱 访问地址:")
        print("  前端: http://localhost:8081")
        print("  管理: http://localhost:8082")
    else:
        print("⚠️  部分测试失败，请检查上述错误")
        sys.exit(1)

if __name__ == "__main__":
    main()