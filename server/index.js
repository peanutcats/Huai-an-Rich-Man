require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const dbConfig = require('./src/config/database')
const gameSocketHandler = require('./src/game/socketHandler')
const apiRoutes = require('./src/routes/api')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
})

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}))

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100次请求
  message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// 基础中间件
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use(express.static('public'))

// API路由
app.use('/api', apiRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 游戏Socket处理
gameSocketHandler(io)

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

const PORT = process.env.PORT || 8081

server.listen(PORT, () => {
  console.log(`🚀 淮安大富翁游戏服务器启动成功`)
  console.log(`📍 服务器地址: http://localhost:${PORT}`)
  console.log(`🎮 游戏模式: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔧 数据库: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

module.exports = app