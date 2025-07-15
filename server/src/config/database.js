const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'huaian_monopoly',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
}

const pool = mysql.createPool(dbConfig)

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功')
    connection.release()
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
  }
}

// 初始化数据库
async function initializeDatabase() {
  try {
    await testConnection()
    // 这里可以添加数据库初始化逻辑
    console.log('📊 数据库初始化完成')
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message)
  }
}

// 执行查询
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('SQL查询错误:', error.message)
    throw error
  }
}

// 开始事务
async function beginTransaction() {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  return connection
}

// 提交事务
async function commitTransaction(connection) {
  await connection.commit()
  connection.release()
}

// 回滚事务
async function rollbackTransaction(connection) {
  await connection.rollback()
  connection.release()
}

// 初始化数据库
initializeDatabase()

module.exports = {
  pool,
  query,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
}