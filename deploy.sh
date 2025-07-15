#!/bin/bash

# 淮安大富翁游戏部署脚本 - openEuler服务器
echo "🚀 开始部署淮安大富翁游戏..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，正在安装..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL 未安装，正在安装..."
    sudo yum install -y mysql-server mysql
    sudo systemctl start mysqld
    sudo systemctl enable mysqld
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2进程管理器..."
    sudo npm install -g pm2
fi

# 1. 安装依赖
echo "📦 安装项目依赖..."
npm run install:all

# 2. 配置数据库
echo "🗄️ 配置数据库..."
cp server/.env.example server/.env
echo "请手动编辑 server/.env 文件配置数据库连接信息"

# 3. 创建数据库
echo "🗄️ 创建数据库结构..."
mysql -u root -p < database/schema.sql

# 4. 构建前端
echo "🔨 构建前端项目..."
cd client && npm run build && cd ..

# 5. 创建PM2配置
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'huaian-monopoly',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 8080
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
}
EOF

# 6. 启动服务
echo "🚀 启动服务..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 7. 配置Nginx (可选)
if command -v nginx &> /dev/null; then
    echo "🌐 配置Nginx反向代理..."
    sudo cat > /etc/nginx/conf.d/huaian-monopoly.conf << 'EOF'
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /path/to/huaian-monopoly/client/dist;  # 替换为实际路径
        try_files $uri $uri/ /index.html;
    }

    # API接口代理
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket代理
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    sudo nginx -t && sudo systemctl reload nginx
fi

# 8. 配置防火墙
echo "🔥 配置防火墙..."
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload

echo "✅ 部署完成！"
echo "🌐 访问地址: http://你的服务器IP:8080"
echo "📊 查看服务状态: pm2 status"
echo "📝 查看日志: pm2 logs huaian-monopoly"
echo "🔄 重启服务: pm2 restart huaian-monopoly"