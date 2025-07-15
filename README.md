# 淮安大富翁游戏

一个基于Vue3 + Node.js + MySQL的多人在线大富翁游戏，融合淮安地理文化特色和金融常识。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Element Plus
- **后端**: Node.js + Express + Socket.io
- **数据库**: MySQL
- **实时通信**: WebSocket (Socket.io)

## 功能特色

- 🎮 最多支持6人联机游玩
- 🗺️ 淮安特色地图设计
- 💰 金融常识与市场交易系统
- 🏘️ 地产购买、建设、租金收取
- 🎯 多种游戏卡牌和随机事件
- 💬 实时聊天系统
- 🏆 排行榜和成就系统

## 项目结构

```
huaian-monopoly/
├── client/          # Vue3前端项目
├── server/          # Node.js后端服务
├── database/        # MySQL数据库脚本
├── docs/           # 项目文档
└── README.md       # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

### 安装依赖

```bash
npm run install:all
```

### 配置数据库

1. 创建MySQL数据库
2. 导入数据库脚本: `database/schema.sql`
3. 配置数据库连接: `server/config/database.js`

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 部署到openEuler服务器

```bash
npm run build
npm start
```

## 开发指南

详细的开发文档请参考 `docs/` 目录。

## 许可证

MIT License