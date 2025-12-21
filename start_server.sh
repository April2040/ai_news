#!/bin/bash

# AI信息聚合平台 - 本地启动脚本
# 创建时间: 2025-12-18

echo "🚀 启动AI信息聚合平台..."
echo "=================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 获取当前目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 工作目录: $SCRIPT_DIR"

# 检查必要文件
REQUIRED_FILES=("index.html" "styles/main.css" "js/main.js" "data/mockData.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误: 缺少必要文件 $file"
        exit 1
    fi
done

echo "✅ 文件检查完成"

# 启动HTTP服务器
echo "🌐 启动HTTP服务器..."
echo "📱 请在浏览器中访问: http://localhost:8081"
echo "⏹️  按 Ctrl+C 停止服务器"
echo "=================================="

# 启动服务器
python3 -m http.server 8081 --bind 0.0.0.0