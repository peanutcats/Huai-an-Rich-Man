@echo off
echo 正在启动淮安大富翁游戏调试模式...
echo.

echo 1. 检查Node.js版本...
node --version
echo.

echo 2. 检查npm版本...
npm --version
echo.

echo 3. 检查MySQL连接...
mysql -u root -pdyw110643355 -e "SELECT 'MySQL连接成功' as status;"
echo.

echo 4. 检查端口占用情况...
netstat -ano | findstr :8080
netstat -ano | findstr :3000
echo.

echo 5. 启动后端服务器（单独）...
cd server
start "后端服务器" cmd /k "npm run dev"
cd ..
echo 等待5秒让后端启动...
timeout /t 5 /nobreak > nul

echo 6. 启动前端服务器（单独）...
cd client
start "前端服务器" cmd /k "npm run dev"
cd ..

echo.
echo 调试启动完成！
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:8080
echo.
pause
