@echo off
chcp 65001 >nul

:: AI信息聚合平台 - Windows启动脚本
:: 创建时间: 2025-12-18

echo 🚀 启动AI信息聚合平台...
echo ==================================

:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请先安装Python3
    pause
    exit /b 1
)

:: 获取当前目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo 📁 工作目录: %SCRIPT_DIR%

:: 检查必要文件
set "FILES=index.html styles\main.css js\main.js data\mockData.js"
for %%f in (%FILES%) do (
    if not exist "%%f" (
        echo ❌ 错误: 缺少必要文件 %%f
        pause
        exit /b 1
    )
)

echo ✅ 文件检查完成

:: 启动HTTP服务器
echo 🌐 启动HTTP服务器...
echo 📱 请在浏览器中访问: http://localhost:8081
echo ⏹️  按 Ctrl+C 停止服务器
echo ==================================

:: 启动服务器
python -m http.server 8081 --bind 0.0.0.0