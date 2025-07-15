# 🎮 淮安大富翁游戏 - 开发指南

## 📖 项目简介

淮安大富翁是一款基于经典大富翁玩法的多人在线游戏，融合了淮安地理文化特色和金融常识教育。游戏支持最多6人同时在线游戏，通过WebSocket实现实时通信。

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3**: 渐进式JavaScript框架
- **TypeScript**: 类型安全的JavaScript超集
- **Element Plus**: Vue 3组件库
- **Vite**: 现代化构建工具
- **Pinia**: Vue状态管理
- **Socket.io-client**: WebSocket客户端

### 后端技术栈
- **Node.js**: JavaScript运行时
- **Express**: Web应用框架
- **Socket.io**: 实时通信
- **MySQL**: 关系型数据库
- **PM2**: 进程管理器

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0

### 1. 克隆项目
```bash
git clone <repository-url>
cd huaian-monopoly
```

### 2. 安装依赖
```bash
# 使用快速启动脚本（推荐）
chmod +x start.sh
./start.sh

# 或者手动安装
npm run install:all
```

### 3. 配置数据库
```bash
# 复制环境配置文件
cp server/.env.example server/.env

# 编辑配置文件
vim server/.env
```

配置内容示例：
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=huaian_monopoly
DB_USER=root
DB_PASSWORD=your_password
```

### 4. 初始化数据库
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE huaian_monopoly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入数据库结构
mysql -u root -p huaian_monopoly < database/schema.sql
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问地址：
- 前端：http://localhost:3000
- 后端：http://localhost:8080

## 🎯 游戏特色

### 淮安文化元素
- **地标建筑**: 淮安府署、河下古镇、清晏园等
- **历史文化**: 韩信故里、漕运文化、水利工程
- **现代发展**: 软件园、保税区、高铁站
- **自然景观**: 洪泽湖、荷花荡、水上森林

### 金融教育内容
- **投资理念**: 不同类型资产的投资特点
- **风险管理**: 多元化投资和风险控制
- **市场机制**: 供需关系对价格的影响
- **经济政策**: 政府政策对市场的影响

### 游戏机制
- **地产购买**: 40个特色地产可供购买
- **租金收取**: 根据房屋数量计算租金
- **机会卡片**: 随机事件增加游戏趣味性
- **交易系统**: 玩家间可进行地产和资金交易
- **破产机制**: 资金不足时的破产处理

## 🏗️ 项目结构

```
huaian-monopoly/
├── client/                 # Vue3前端项目
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── views/         # 页面组件
│   │   ├── stores/        # Pinia状态管理
│   │   ├── types/         # TypeScript类型定义
│   │   ├── utils/         # 工具函数
│   │   └── router/        # 路由配置
│   ├── public/            # 静态资源
│   └── package.json
├── server/                # Node.js后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── game/          # 游戏逻辑
│   │   ├── config/        # 配置文件
│   │   └── utils/         # 工具函数
│   ├── index.js           # 服务器入口
│   └── package.json
├── database/              # 数据库脚本
│   └── schema.sql         # 数据库结构
├── docs/                  # 项目文档
├── deploy.sh              # 部署脚本
├── start.sh               # 启动脚本
└── README.md
```

## 🎮 游戏规则

### 基本玩法
1. **开始游戏**: 2-6名玩家，每人起始资金15000元
2. **掷骰子**: 轮流掷骰子移动棋子
3. **购买地产**: 停留在无主地产可选择购买
4. **支付租金**: 停留在他人地产需支付租金
5. **建造房屋**: 拥有同组地产可建造房屋增加租金
6. **抽取卡片**: 停留在机会/公共服务格子抽取卡片
7. **游戏胜利**: 最后一个未破产的玩家获胜

### 特殊格子
- **起点**: 经过获得2000元
- **监狱**: 临时拘留，可通过掷双数或支付500元出狱
- **去监狱**: 直接进入监狱
- **税收**: 所得税200元，奢侈税750元
- **免费停车**: 无特殊效果

## 🔧 开发说明

### 前端开发
```bash
cd client
npm run dev     # 开发模式
npm run build   # 构建生产版本
npm run preview # 预览构建结果
```

### 后端开发
```bash
cd server
npm run dev     # 开发模式（nodemon）
npm start       # 生产模式
```

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循Vue 3组合式API最佳实践
- 使用TypeScript提供类型安全

### 数据库操作
```bash
# 重置数据库
mysql -u root -p huaian_monopoly < database/schema.sql

# 备份数据库
mysqldump -u root -p huaian_monopoly > backup.sql
```

## 🚀 部署指南

### 开发环境部署
```bash
npm run dev
```

### 生产环境部署
```bash
# 构建前端
npm run build

# 使用PM2启动服务
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Docker部署（可选）
```bash
# 构建镜像
docker build -t huaian-monopoly .

# 运行容器
docker run -d -p 8080:8080 huaian-monopoly
```

### openEuler服务器部署
```bash
# 使用部署脚本
chmod +x deploy.sh
./deploy.sh
```

## 📊 性能优化

### 前端优化
- 使用Vite进行快速构建
- 组件懒加载减少首屏加载时间
- 图片资源压缩和CDN加速
- 使用PWA技术提升用户体验

### 后端优化
- 数据库连接池管理
- Redis缓存热点数据
- 集群部署提高并发能力
- 负载均衡分散请求压力

## 🐛 常见问题

### Q: 无法连接数据库
A: 检查MySQL服务是否启动，配置文件中的数据库连接信息是否正确

### Q: 前端无法连接后端
A: 检查后端服务是否启动，CORS配置是否正确

### Q: WebSocket连接失败
A: 检查防火墙设置，确保端口8080可访问

### Q: 游戏卡顿或延迟
A: 检查网络连接，优化数据库查询，考虑增加服务器资源

## 🤝 贡献指南

1. Fork本项目
2. 创建feature分支
3. 提交更改
4. 发起Pull Request

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建工具
```

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为淮安大富翁游戏项目做出贡献的开发者！

---

**Happy Gaming! 🎮**