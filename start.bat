@echo off
chcp 65001 > nul

echo 🎮 淮安大富翁游戏 - 快速启动
echo ==================================

:: 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装Node.js (版本 ^>= 16)
    pause
    exit /b 1
)

:: 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装npm
    pause
    exit /b 1
)

:: 显示版本信息
echo 📋 环境信息:
echo    Node.js: 
node --version
echo    npm: 
npm --version
echo.

:: 安装依赖
echo 📦 安装项目依赖...
if not exist "node_modules" (
    npm install
)

cd client
if not exist "node_modules" (
    echo    -^> 安装前端依赖...
    npm install
)
cd ..

cd server
if not exist "node_modules" (
    echo    -^> 安装后端依赖...
    npm install
)
cd ..

:: 配置环境变量
if not exist "server\.env" (
    echo ⚙️  创建环境配置文件...
    copy "server\.env.example" "server\.env"
    echo    -^> 请编辑 server\.env 文件配置数据库连接信息
)

:: 数据库提醒
echo.
echo 🗄️  数据库配置提醒:
echo    1. 请确保MySQL服务已启动
echo    2. 创建数据库: CREATE DATABASE huaian_monopoly;
echo    3. 导入数据库结构: mysql -u root -p ^< database\schema.sql
echo    4. 配置数据库连接信息在 server\.env 文件中
echo.

:: 启动开发服务器
echo 🚀 启动开发服务器...
echo    -^> 前端服务: http://localhost:3000
echo    -^> 后端服务: http://localhost:8080
echo.

:: 提示用户
echo 💡 提示:
echo    - 游戏支持最多6人同时在线
echo    - 在浏览器中访问 http://localhost:3000 开始游戏
echo    - 按 Ctrl+C 停止服务器
echo.

:: 启动服务
npm run dev

pause