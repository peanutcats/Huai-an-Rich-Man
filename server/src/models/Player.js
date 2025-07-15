const { query } = require('../config/database')

class Player {
  constructor(id, name, socketId = null) {
    this.id = id
    this.name = name
    this.socketId = socketId
    this.position = 0
    this.money = 15000
    this.properties = []
    this.inJail = false
    this.jailTurns = 0
    this.color = '#FF6B6B'
    this.avatar = ''
    this.isOnline = true
    this.isBankrupt = false
  }

  async save() {
    const sql = `
      INSERT INTO players (id, name, avatar, is_online) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        avatar = VALUES(avatar),
        is_online = VALUES(is_online),
        last_login = CURRENT_TIMESTAMP
    `
    return await query(sql, [this.id, this.name, this.avatar, this.isOnline])
  }

  static async findById(id) {
    const sql = 'SELECT * FROM players WHERE id = ?'
    const result = await query(sql, [id])
    return result[0] || null
  }

  static async findByName(name) {
    const sql = 'SELECT * FROM players WHERE name = ?'
    const result = await query(sql, [name])
    return result[0] || null
  }

  addMoney(amount) {
    this.money += amount
    return this.money
  }

  subtractMoney(amount) {
    this.money = Math.max(0, this.money - amount)
    return this.money
  }

  addProperty(propertyId) {
    if (!this.properties.includes(propertyId)) {
      this.properties.push(propertyId)
    }
  }

  removeProperty(propertyId) {
    this.properties = this.properties.filter(id => id !== propertyId)
  }

  hasProperty(propertyId) {
    return this.properties.includes(propertyId)
  }

  moveTo(position) {
    this.position = position
  }

  goToJail() {
    this.inJail = true
    this.jailTurns = 0
    this.position = 10 // 监狱位置
  }

  releaseFromJail() {
    this.inJail = false
    this.jailTurns = 0
  }

  canPurchase(price) {
    return this.money >= price && !this.isBankrupt
  }

  setBankrupt() {
    this.isBankrupt = true
    this.properties = []
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      money: this.money,
      properties: this.properties,
      inJail: this.inJail,
      jailTurns: this.jailTurns,
      color: this.color,
      avatar: this.avatar,
      isOnline: this.isOnline,
      isBankrupt: this.isBankrupt
    }
  }
}

module.exports = Player