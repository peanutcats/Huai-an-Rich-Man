const { query } = require('../config/database')
const { v4: uuidv4 } = require('uuid')

class Room {
  constructor(id, name, hostId, maxPlayers = 6) {
    this.id = id || uuidv4()
    this.name = name
    this.hostId = hostId
    this.maxPlayers = maxPlayers
    this.players = []
    this.status = 'waiting'
    this.settings = {
      startingMoney: 15000,
      maxTurns: 100,
      enableTrading: true,
      enableAuction: true,
      timeLimit: 300000 // 5分钟每回合
    }
    this.createdAt = new Date()
    this.game = null
  }

  async save() {
    const sql = `
      INSERT INTO rooms (id, name, host_id, max_players, current_players, status, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        max_players = VALUES(max_players),
        current_players = VALUES(current_players),
        status = VALUES(status),
        settings = VALUES(settings)
    `
    return await query(sql, [
      this.id,
      this.name,
      this.hostId,
      this.maxPlayers,
      this.players.length,
      this.status,
      JSON.stringify(this.settings)
    ])
  }

  static async findById(id) {
    const sql = 'SELECT * FROM rooms WHERE id = ?'
    const result = await query(sql, [id])
    return result[0] || null
  }

  static async findAll() {
    const sql = 'SELECT * FROM rooms WHERE status != "ended" ORDER BY created_at DESC'
    return await query(sql)
  }

  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('房间已满')
    }
    
    if (this.players.find(p => p.id === player.id)) {
      throw new Error('玩家已在房间中')
    }

    // 设置玩家颜色
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#F0932B', '#EB4D4B']
    player.color = colors[this.players.length]
    
    this.players.push(player)
    return player
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId)
    
    // 如果房主离开，转移房主权限
    if (this.hostId === playerId && this.players.length > 0) {
      this.hostId = this.players[0].id
    }
  }

  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId)
  }

  canStart() {
    return this.players.length >= 2 && this.status === 'waiting'
  }

  startGame() {
    if (!this.canStart()) {
      throw new Error('无法开始游戏')
    }
    
    this.status = 'playing'
    // 这里会创建Game实例
    return true
  }

  endGame(winnerId) {
    this.status = 'ended'
    this.winnerId = winnerId
  }

  isFull() {
    return this.players.length >= this.maxPlayers
  }

  isHost(playerId) {
    return this.hostId === playerId
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      hostId: this.hostId,
      maxPlayers: this.maxPlayers,
      players: this.players.map(p => p.toJSON()),
      status: this.status,
      settings: this.settings,
      createdAt: this.createdAt,
      isFull: this.isFull()
    }
  }
}

module.exports = Room