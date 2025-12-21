#!/bin/bash

# AI信息聚合平台 - 完整启动脚本
# 集成真实数据收集和Web服务
# 创建时间: 2025-12-21

echo "🚀 AI信息聚合平台 - 真实数据版本启动脚本"
echo "=================================================="

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 工作目录: $SCRIPT_DIR"

# 检查并激活虚拟环境
VENV_DIR="$SCRIPT_DIR/.venv"
if [ -d "$VENV_DIR" ]; then
    echo "✅ 检测到虚拟环境: $VENV_DIR"
    source "$VENV_DIR/bin/activate"
    echo "✅ 虚拟环境已激活"
else
    echo "⚠️  未找到虚拟环境，尝试创建..."
    python3 -m venv "$VENV_DIR"
    if [ $? -eq 0 ]; then
        source "$VENV_DIR/bin/activate"
        echo "✅ 虚拟环境创建并激活成功"
    else
        echo "❌ 创建虚拟环境失败"
        exit 1
    fi
fi

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查uv包管理器
if ! command -v uv &> /dev/null; then
    echo "⚠️  警告: 未找到uv包管理器，将使用pip安装依赖"
    USE_UV=false
else
    echo "✅ 检测到uv包管理器"
    USE_UV=true
fi

# 安装依赖
echo "📦 安装Python依赖包..."
if [ "$USE_UV" = true ]; then
    uv pip install -r requirements.txt
else
    pip install -r requirements.txt
fi

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 检查必要文件
REQUIRED_FILES=("index_realdata.html" "data_collector.py" "js/realDataLoader.js" "js/main_realdata.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误: 缺少必要文件 $file"
        exit 1
    fi
done

echo "✅ 文件检查完成"

# 创建必要的目录
mkdir -p data logs

# 启动选项菜单
echo ""
echo "请选择启动模式:"
echo "1) 开发模式 - 启动Web服务器 + 数据收集服务"
echo "2) 仅Web服务器 - 只提供前端界面"
echo "3) 仅数据收集 - 只收集数据，不启动Web服务器"
echo "4) 单次数据收集 - 执行一次数据收集"
echo "5) 查看服务状态"
echo "6) 退出"

read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        echo "🌐 启动开发模式..."
        echo "📊 启动数据收集服务..."
        
        # 后台启动数据收集服务
        python3 data_collection_service.py --mode service &
        COLLECTOR_PID=$!
        
        echo "🔄 数据收集服务PID: $COLLECTOR_PID"
        
        # 等待数据收集服务启动
        sleep 3
        
        # 启动Web服务器
        echo "🌐 启动Web服务器..."
        python3 -m http.server 8081 --bind 0.0.0.0 &
        WEB_PID=$!
        
        echo "🔄 Web服务器PID: $WEB_PID"
        echo ""
        echo "🎉 服务启动完成!"
        echo "📱 请在浏览器中访问: http://localhost:8081"
        echo "🔧 数据管理界面: http://localhost:8082"
        echo ""
        echo "⚠️  按 Ctrl+C 停止所有服务"
        
        # 保存PID到文件
        echo $COLLECTOR_PID > logs/collector.pid
        echo $WEB_PID > logs/web.pid
        
        # 等待用户中断
        trap 'echo ""; echo "🛑 正在停止服务..."; kill $COLLECTOR_PID $WEB_PID 2>/dev/null; rm -f logs/*.pid; echo "👋 服务已停止"; exit 0' INT
        wait
        ;;
        
    2)
        echo "🌐 启动Web服务器..."
        python3 -m http.server 8081 --bind 0.0.0.0
        ;;
        
    3)
        echo "📊 启动数据收集服务..."
        python3 data_collection_service.py --mode service
        ;;
        
    4)
        echo "📊 执行单次数据收集..."
        python3 data_collector.py
        ;;
        
    5)
        echo "📋 检查服务状态..."
        if [ -f "logs/collector.pid" ]; then
            COLLECTOR_PID=$(cat logs/collector.pid)
            if kill -0 $COLLECTOR_PID 2>/dev/null; then
                echo "✅ 数据收集服务运行中 (PID: $COLLECTOR_PID)"
            else
                echo "❌ 数据收集服务未运行"
                rm -f logs/collector.pid
            fi
        else
            echo "❌ 数据收集服务未启动"
        fi
        
        if [ -f "logs/web.pid" ]; then
            WEB_PID=$(cat logs/web.pid)
            if kill -0 $WEB_PID 2>/dev/null; then
                echo "✅ Web服务器运行中 (PID: $WEB_PID)"
            else
                echo "❌ Web服务器未运行"
                rm -f logs/web.pid
            fi
        else
            echo "❌ Web服务器未启动"
        fi
        ;;
        
    6)
        echo "👋 退出"
        exit 0
        ;;
        
    *)
        echo "❌ 无效选项，请重新运行脚本"
        exit 1
        ;;
esac