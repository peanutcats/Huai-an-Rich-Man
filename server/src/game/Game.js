const { v4: uuidv4 } = require('uuid')
const { HUAIAN_PROPERTIES, CHANCE_CARDS, COMMUNITY_CARDS } = require('../utils/gameData')
const { query } = require('../config/database')

class Game {
  constructor(roomId, players) {
    this.id = uuidv4()
    this.roomId = roomId
    this.players = players.map((player, index) => ({
      ...player,
      position: 0,
      money: 15000,
      properties: [],
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      color: this.getPlayerColor(index)
    }))
    this.currentPlayerIndex = 0
    this.phase = 'playing'
    this.board = HUAIAN_PROPERTIES.map(prop => ({
      ...prop,
      owner: null,
      houses: 0,
      hotels: 0,
      mortgaged: false
    }))
    this.dice = [1, 1]
    this.turn = 1
    this.chanceCards = [...CHANCE_CARDS]
    this.communityCards = [...COMMUNITY_CARDS]
    this.gameEvents = []
    this.winner = null
    this.createdAt = new Date()
  }

  getPlayerColor(index) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#F0932B', '#EB4D4B']
    return colors[index] || '#888888'
  }

  async save() {
    const sql = `
      INSERT INTO games (id, room_id, status, current_player_index, turn_number, game_state, winner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        current_player_index = VALUES(current_player_index),
        turn_number = VALUES(turn_number),
        game_state = VALUES(game_state),
        winner_id = VALUES(winner_id)
    `
    return await query(sql, [
      this.id,
      this.roomId,
      this.phase,
      this.currentPlayerIndex,
      this.turn,
      JSON.stringify(this.getState()),
      this.winner
    ])
  }

  isPlayerTurn(playerId) {
    return this.players[this.currentPlayerIndex]?.id === playerId
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex]
  }

  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId)
  }

  async rollDice(playerId) {
    if (!this.isPlayerTurn(playerId)) {
      throw new Error('不是你的回合')
    }

    const player = this.getCurrentPlayer()
    if (player.isBankrupt) {
      throw new Error('破产玩家无法行动')
    }

    // 生成随机骰子
    this.dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ]

    const diceSum = this.dice[0] + this.dice[1]
    const isDouble = this.dice[0] === this.dice[1]

    // 处理监狱逻辑
    if (player.inJail) {
      if (isDouble) {
        player.inJail = false
        player.jailTurns = 0
        this.addGameEvent('jailRelease', { playerId, reason: 'double' })
      } else {
        player.jailTurns++
        if (player.jailTurns >= 3) {
          player.inJail = false
          player.jailTurns = 0
          player.money = Math.max(0, player.money - 500)
          this.addGameEvent('jailRelease', { playerId, reason: 'payment' })
        } else {
          this.nextTurn()
          return {
            playerId,
            dice: this.dice,
            diceSum,
            isDouble,
            inJail: true,
            jailTurns: player.jailTurns
          }
        }
      }
    }

    // 移动玩家
    const oldPosition = player.position
    player.position = (player.position + diceSum) % 40

    // 检查是否经过起点
    if (player.position < oldPosition) {
      player.money += 2000
      this.addGameEvent('passStart', { playerId, amount: 2000 })
    }

    // 处理当前位置
    await this.handlePlayerLanding(player)

    // 检查游戏是否结束
    this.checkGameEnd()

    // 如果没有掷出双数，切换到下一个玩家
    if (!isDouble || player.inJail) {
      this.nextTurn()
    }

    await this.save()

    return {
      playerId,
      dice: this.dice,
      diceSum,
      isDouble,
      oldPosition,
      newPosition: player.position,
      passedStart: player.position < oldPosition
    }
  }

  async handlePlayerLanding(player) {
    const property = this.board.find(p => p.position === player.position)
    if (!property) return

    switch (property.group) {
      case 'special':
        // 起点，什么都不做
        break
      
      case 'chance':
        await this.drawChanceCard(player)
        break
      
      case 'community':
        await this.drawCommunityCard(player)
        break
      
      case 'tax':
        await this.payTax(player, property)
        break
      
      case 'jail':
        // 只是访问监狱，不做任何处理
        break
      
      case 'gotojail':
        this.sendToJail(player)
        break
      
      case 'parking':
        // 免费停车，什么都不做
        break
      
      default:
        // 普通地产
        await this.handlePropertyLanding(player, property)
        break
    }
  }

  async handlePropertyLanding(player, property) {
    if (!property.owner) {
      // 无主地产，可以购买
      this.addGameEvent('landOnProperty', {
        playerId: player.id,
        propertyId: property.id,
        canBuy: player.money >= property.price
      })
    } else if (property.owner !== player.id && !property.mortgaged) {
      // 需要支付租金
      const rent = this.calculateRent(property)
      const owner = this.getPlayer(property.owner)
      
      if (owner && !owner.isBankrupt) {
        player.money = Math.max(0, player.money - rent)
        owner.money += rent
        
        this.addGameEvent('payRent', {
          payerId: player.id,
          receiverId: owner.id,
          propertyId: property.id,
          amount: rent
        })

        // 检查玩家是否破产
        if (player.money === 0) {
          this.handleBankruptcy(player)
        }
      }
    }
  }

  calculateRent(property) {
    let rent = property.rent
    
    // 铁路租金计算
    if (property.group === 'railroad') {
      const railroadCount = this.board.filter(p => 
        p.group === 'railroad' && p.owner === property.owner
      ).length
      rent *= Math.pow(2, railroadCount - 1)
    }
    
    // 公用事业租金计算
    if (property.group === 'utility') {
      const utilityCount = this.board.filter(p => 
        p.group === 'utility' && p.owner === property.owner
      ).length
      const multiplier = utilityCount === 1 ? 4 : 10
      rent = (this.dice[0] + this.dice[1]) * multiplier
    }
    
    // 房屋和酒店加成
    if (property.houses > 0) {
      rent *= (1 + property.houses * 0.5)
    }
    if (property.hotels > 0) {
      rent *= (1 + property.hotels * 2)
    }
    
    return Math.floor(rent)
  }

  async buyProperty(playerId, propertyId) {
    const player = this.getPlayer(playerId)
    const property = this.board.find(p => p.id === propertyId)
    
    if (!player || !property) {
      throw new Error('玩家或地产不存在')
    }
    
    if (player.position !== property.position) {
      throw new Error('您不在此地产位置')
    }
    
    if (property.owner) {
      throw new Error('地产已被购买')
    }
    
    if (player.money < property.price) {
      throw new Error('资金不足')
    }
    
    if (property.price <= 0) {
      throw new Error('此地产无法购买')
    }

    // 执行购买
    player.money -= property.price
    property.owner = playerId
    player.properties.push(propertyId)
    
    this.addGameEvent('buyProperty', {
      playerId,
      propertyId,
      price: property.price
    })

    await this.save()
    
    return {
      playerId,
      propertyId,
      price: property.price,
      remainingMoney: player.money
    }
  }

  async buildHouse(playerId, propertyId) {
    const player = this.getPlayer(playerId)
    const property = this.board.find(p => p.id === propertyId)
    
    if (!player || !property) {
      throw new Error('玩家或地产不存在')
    }
    
    if (property.owner !== playerId) {
      throw new Error('您不拥有此地产')
    }
    
    if (property.houses >= 4) {
      throw new Error('已达到最大房屋数量')
    }
    
    const housePrice = property.price * 0.5
    if (player.money < housePrice) {
      throw new Error('资金不足建造房屋')
    }

    // 执行建造
    player.money -= housePrice
    property.houses++
    
    this.addGameEvent('buildHouse', {
      playerId,
      propertyId,
      price: housePrice,
      houses: property.houses
    })

    await this.save()
    
    return {
      playerId,
      propertyId,
      price: housePrice,
      houses: property.houses
    }
  }

  async drawChanceCard(player) {
    if (this.chanceCards.length === 0) {
      this.chanceCards = [...CHANCE_CARDS]
    }
    
    const cardIndex = Math.floor(Math.random() * this.chanceCards.length)
    const card = this.chanceCards[cardIndex]
    
    this.addGameEvent('drawCard', {
      playerId: player.id,
      cardType: 'chance',
      card: card
    })
    
    await this.executeCardAction(player, card)
  }

  async drawCommunityCard(player) {
    if (this.communityCards.length === 0) {
      this.communityCards = [...COMMUNITY_CARDS]
    }
    
    const cardIndex = Math.floor(Math.random() * this.communityCards.length)
    const card = this.communityCards[cardIndex]
    
    this.addGameEvent('drawCard', {
      playerId: player.id,
      cardType: 'community',
      card: card
    })
    
    await this.executeCardAction(player, card)
  }

  async executeCardAction(player, card) {
    switch (card.action) {
      case 'addMoney':
        player.money += card.amount
        break
      
      case 'loseMoney':
        player.money = Math.max(0, player.money - card.amount)
        if (player.money === 0) {
          this.handleBankruptcy(player)
        }
        break
      
      case 'moveToPosition':
        if (card.position < player.position) {
          player.money += 2000 // 经过起点
        }
        player.position = card.position
        await this.handlePlayerLanding(player)
        break
      
      case 'collectFromAll':
        this.players.forEach(p => {
          if (p.id !== player.id && !p.isBankrupt) {
            p.money = Math.max(0, p.money - card.amount)
            player.money += card.amount
          }
        })
        break
      
      case 'doubleRent':
        // 下次收取租金时翻倍（需要在游戏状态中标记）
        player.doubleRentNext = true
        break
    }
  }

  async payTax(player, property) {
    const taxAmount = property.id === 'prop_4' ? 200 : 750 // 所得税或奢侈税
    player.money = Math.max(0, player.money - taxAmount)
    
    this.addGameEvent('payTax', {
      playerId: player.id,
      propertyId: property.id,
      amount: taxAmount
    })
    
    if (player.money === 0) {
      this.handleBankruptcy(player)
    }
  }

  sendToJail(player) {
    player.inJail = true
    player.jailTurns = 0
    player.position = 10 // 监狱位置
    
    this.addGameEvent('goToJail', {
      playerId: player.id
    })
  }

  handleBankruptcy(player) {
    player.isBankrupt = true
    
    // 将所有地产归还给银行
    this.board.forEach(property => {
      if (property.owner === player.id) {
        property.owner = null
        property.houses = 0
        property.hotels = 0
        property.mortgaged = false
      }
    })
    
    player.properties = []
    
    this.addGameEvent('bankruptcy', {
      playerId: player.id
    })
    
    this.checkGameEnd()
  }

  checkGameEnd() {
    const activePlayers = this.players.filter(p => !p.isBankrupt)
    
    if (activePlayers.length === 1) {
      this.winner = activePlayers[0].id
      this.phase = 'ended'
      
      this.addGameEvent('gameEnd', {
        winnerId: this.winner,
        finalRankings: this.players.map(p => ({
          id: p.id,
          name: p.name,
          money: p.money,
          properties: p.properties.length
        })).sort((a, b) => b.money - a.money)
      })
    } else if (this.turn > 200) {
      // 超过最大回合数，按资产排名
      const winner = activePlayers.reduce((prev, current) => 
        prev.money > current.money ? prev : current
      )
      this.winner = winner.id
      this.phase = 'ended'
    }
  }

  nextTurn() {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    } while (this.players[this.currentPlayerIndex].isBankrupt)
    
    if (this.currentPlayerIndex === 0) {
      this.turn++
    }
  }

  addGameEvent(type, data) {
    this.gameEvents.push({
      id: uuidv4(),
      type,
      data,
      timestamp: new Date(),
      turn: this.turn
    })
  }

  getState() {
    return {
      id: this.id,
      roomId: this.roomId,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        money: p.money,
        properties: p.properties,
        inJail: p.inJail,
        jailTurns: p.jailTurns,
        isBankrupt: p.isBankrupt,
        color: p.color,
        isOnline: p.isOnline
      })),
      currentPlayer: this.currentPlayerIndex,
      phase: this.phase,
      board: this.board,
      dice: this.dice,
      turn: this.turn,
      winner: this.winner,
      gameEvents: this.gameEvents.slice(-10) // 只返回最近10个事件
    }
  }
}

module.exports = Game