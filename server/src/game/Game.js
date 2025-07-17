const { v4: uuidv4 } = require('uuid')
const { HUAIAN_PROPERTIES, CHANCE_CARDS, COMMUNITY_CARDS, CANAL_TREASURE_CARDS, GROUP_MONOPOLY_EFFECTS } = require('../utils/gameData')
const { query } = require('../config/database')

class Game {
  constructor(roomId, players) {
    this.id = uuidv4()
    this.roomId = roomId
    this.players = players.map((player, index) => ({
      ...player,
      position: 0,
      money: 15000, // {{ AURA-X: Modify - 调整起始资金以适应新的地块价格 }}
      properties: [],
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      color: this.getPlayerColor(index),
      hasShip: false, // 运河船只
      buffs: [], // 各种buff效果
      monopolies: [] // 拥有的垄断组
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
    
    // 拍卖系统
    this.auctionData = {
      isActive: false,
      propertyId: null,
      currentBid: 0,
      highestBidder: null,
      participants: [],
      timeRemaining: 0,
      startTime: null
    }
    
    // 抵押系统
    this.mortgageData = {
      mortgagedProperties: new Map(), // propertyId -> mortgage info
      interestRate: 0.1 // 10%利率
    }
    
    // 股票交易系统
    this.stockData = {
      stocks: [
        { id: 'HUAI_FOOD', name: '淮安食品集团', price: 100, trend: 'stable', volume: 0 },
        { id: 'HUAI_TECH', name: '淮安科技', price: 150, trend: 'up', volume: 0 },
        { id: 'HUAI_TOURISM', name: '淮安文旅', price: 80, trend: 'down', volume: 0 },
        { id: 'HUAI_BANK', name: '淮安银行', price: 120, trend: 'stable', volume: 0 }
      ],
      playerStocks: new Map() // playerId -> {stockId: quantity}
    }
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
      player.money += 2000 // {{ AURA-X: Modify - 调整经过起点奖励以适应新的经济规模 }}
      this.addGameEvent('passStart', { playerId, amount: 2000 })
    }

    // 处理当前位置
    const eventResult = await this.handlePlayerLanding(player)

    // 检查游戏是否结束
    this.checkGameEnd()

    // 如果没有掷出双数且没有需要用户交互的事件，切换到下一个玩家
    const needsUserInteraction = eventResult && (
      eventResult.type === 'property' ||
      eventResult.type === 'chance' ||
      eventResult.type === 'community' ||
      eventResult.type === 'tax' ||
      eventResult.type === 'rent'
    )

    // {{ AURA-X: Add - 添加回合切换逻辑的详细日志 }}
    console.log(`🎲 掷骰子结果分析:`)
    console.log(`   - 是否双数: ${isDouble}`)
    console.log(`   - 玩家是否在监狱: ${player.inJail}`)
    console.log(`   - 是否需要用户交互: ${needsUserInteraction}`)
    console.log(`   - 事件类型: ${eventResult?.type || '无事件'}`)

    if (!isDouble && !player.inJail && !needsUserInteraction) {
      console.log(`⏭️ 自动切换到下一个玩家`)
      this.nextTurn()
    } else {
      console.log(`⏸️ 等待用户交互或处理特殊情况`)
    }

    await this.save()

    return {
      playerId,
      dice: this.dice,
      diceSum,
      isDouble,
      oldPosition,
      newPosition: player.position,
      passedStart: player.position < oldPosition,
      event: eventResult,
      needsUserInteraction
    }
  }

  async handlePlayerLanding(player) {
    const property = this.board.find(p => p.position === player.position)

    // {{ AURA-X: Add - 添加详细调试日志来追踪地块匹配和事件触发 }}
    console.log(`🎯 玩家 ${player.id} 到达位置 ${player.position}`)
    console.log(`🏠 找到的地块:`, property ? `${property.name} (ID: ${property.id}, Group: ${property.group}, Price: ${property.price}, Owner: ${property.owner})` : '未找到地块')

    if (!property) {
      console.log(`❌ 位置 ${player.position} 没有找到对应的地块`)
      return null
    }

    let eventResult = null

    switch (property.group) {
      case 'special':
        // 起点，什么都不做
        if (property.position === 0) {
          eventResult = {
            type: 'special',
            message: '欢迎来到起点！',
            playerId: player.id
          }
        }
        break
      
      case 'chance':
        eventResult = await this.drawChanceCard(player)
        break
      
      case 'community':
        eventResult = await this.drawCommunityCard(player)
        break
      
      case 'tax':
        eventResult = await this.payTax(player, property)
        break
      
      case 'jail':
        // 只是访问监狱，不做任何处理
        eventResult = {
          type: 'jail',
          message: '您正在监狱中访问',
          playerId: player.id
        }
        break
      
      case 'gotojail':
        this.sendToJail(player)
        eventResult = {
          type: 'gotojail',
          message: '您被送进了监狱！',
          playerId: player.id
        }
        break
      
      case 'parking':
        // 运河码头，抽取运河宝藏卡
        if (property.position === 20) {
          eventResult = await this.drawCanalTreasureCard(player)
        } else {
          // 其他免费停车
          eventResult = {
            type: 'parking',
            message: '在这里休息一下吧',
            playerId: player.id
          }
        }
        break
      
      default:
        // 普通地产
        console.log(`🏘️ 处理普通地产: ${property.name}`)
        eventResult = await this.handlePropertyPurchaseOrRent(player, property)
        break
    }

    // {{ AURA-X: Add - 记录事件处理结果 }}
    console.log(`📋 事件处理结果:`, eventResult)

    return eventResult
  }

  async handlePropertyPurchaseOrRent(player, property) {
    // {{ AURA-X: Add - 添加详细的地产处理日志 }}
    console.log(`🏠 处理地产着陆: 玩家 ${player.id} 到达 ${property.name}`)
    console.log(`💰 地产信息: 价格=${property.price}, 拥有者=${property.owner}, 玩家资金=${player.money}`)

    if (!property.owner && property.price > 0) {
      // 无主地产，可以购买
      console.log(`✅ 可购买地产: ${property.name}, 价格: ${property.price}`)

      this.addGameEvent('landOnProperty', {
        playerId: player.id,
        propertyId: property.id,
        canBuy: player.money >= property.price
      })

      const purchaseEvent = {
        type: 'property',
        propertyId: property.id,
        propertyName: property.name,
        price: property.price,
        canBuy: player.money >= property.price,
        playerId: player.id
      }

      console.log(`🎯 生成购买事件:`, purchaseEvent)
      return purchaseEvent
    } else if (property.owner && property.owner !== player.id && !property.mortgaged) {
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
        
        return {
          type: 'rent',
          propertyName: property.name,
          amount: rent,
          ownerName: owner.name,
          playerId: player.id
        }
      }
    } else if (property.owner === player.id) {
      // 玩家自己的地产，可以考虑升级
      const canUpgrade = property.houses < 4 && property.price > 0
      const upgradePrice = Math.floor(property.price * 0.5)
      
      return {
        type: 'ownProperty',
        propertyId: property.id,
        propertyName: property.name,
        message: `欢迎回到您的${property.name}`,
        canUpgrade,
        upgradePrice,
        currentHouses: property.houses,
        maxHouses: 4,
        playerId: player.id
      }
    }
    
    return null
  }

  // 检查垄断
  checkMonopoly(player, group) {
    if (['special', 'chance', 'community', 'tax', 'jail', 'gotojail', 'parking'].includes(group)) {
      return // 这些组不能垄断
    }
    
    const groupProperties = this.board.filter(p => p.group === group && p.price > 0)
    const playerGroupProperties = groupProperties.filter(p => p.owner === player.id)
    
    if (playerGroupProperties.length === groupProperties.length) {
      // 形成垄断
      if (!player.monopolies.includes(group)) {
        player.monopolies.push(group)
        this.addGameEvent('monopoly', {
          playerId: player.id,
          group: group,
          groupName: GROUP_MONOPOLY_EFFECTS[group]?.name || group,
          effect: GROUP_MONOPOLY_EFFECTS[group]?.effect || '垄断效果'
        })
      }
    }
  }

  calculateRent(property) {
    let rent = property.rent
    const owner = this.getPlayer(property.owner)
    
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
    
    // 垄断基础租金翻倍（无房屋时）
    if (owner && owner.monopolies.includes(property.group) && property.houses === 0) {
      rent *= 2
    }
    
    // 房屋和酒店加成 - 更显著的租金增益
    if (property.houses > 0) {
      // 每个房屋增加100%的租金，最多400%
      rent *= (1 + property.houses * 1.0)
    }
    if (property.hotels > 0) {
      // 酒店提供更大的收益
      rent *= (1 + property.hotels * 3)
    }
    
    // 垄断组特殊效果
    if (owner && owner.monopolies.includes(property.group)) {
      const monopolyEffect = GROUP_MONOPOLY_EFFECTS[property.group]
      if (monopolyEffect && typeof monopolyEffect.bonus === 'number') {
        rent *= (1 + monopolyEffect.bonus)
      }
    }
    
    // 玩家buff效果
    if (owner && owner.buffs) {
      owner.buffs.forEach(buff => {
        if (buff.remaining > 0) {
          switch (buff.type) {
            case 'rentBonus':
              rent *= (1 + buff.value / 100)
              break
            case 'canalBonus':
              if (property.name.includes('运河') || property.name.includes('里运河')) {
                rent *= (1 + buff.value / 100)
              }
              break
            case 'doubleRent':
              rent *= 2
              break
          }
        }
      })
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
    
    // 检查是否形成垄断
    this.checkMonopoly(player, property.group)
    
    this.addGameEvent('buyProperty', {
      playerId,
      propertyId,
      propertyName: property.name,
      price: property.price
    })

    await this.save()
    
    return {
      playerId,
      propertyId,
      propertyName: property.name,
      playerName: player.name,
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
    
    if (property.price <= 0) {
      throw new Error('此地产无法建造房屋')
    }
    
    // 根据地产价值计算房屋建造成本
    let housePrice = Math.floor(property.price * 0.5)
    
    // 检查建造折扣buff
    const buildDiscountBuff = player.buffs.find(b => b.type === 'buildDiscount' && b.remaining > 0)
    if (buildDiscountBuff) {
      housePrice = Math.floor(housePrice * (1 - buildDiscountBuff.value / 100))
      buildDiscountBuff.remaining--
      this.addGameEvent('buffUsed', {
        playerId: player.id,
        buffType: 'buildDiscount',
        message: '使用了建造折扣！'
      })
    }
    
    // 检查垄断组建造折扣（教育科研组）
    if (player.monopolies.includes('green')) {
      housePrice = Math.floor(housePrice * 0.75) // 减少25%
    }
    
    if (player.money < housePrice) {
      throw new Error('资金不足建造房屋')
    }

    // 执行建造
    player.money -= housePrice
    property.houses++
    
    this.addGameEvent('buildHouse', {
      playerId,
      propertyId,
      propertyName: property.name,
      price: housePrice,
      houses: property.houses
    })

    await this.save()
    
    return {
      playerId,
      propertyId,
      propertyName: property.name,
      playerName: player.name,
      price: housePrice,
      houses: property.houses,
      remainingMoney: player.money
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
    
    return {
      type: 'chance',
      card: card,
      playerId: player.id
    }
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
    
    return {
      type: 'community',
      card: card,
      playerId: player.id
    }
  }

  async drawCanalTreasureCard(player) {
    // 运河宝藏卡池，不消耗卡片
    const cardIndex = Math.floor(Math.random() * CANAL_TREASURE_CARDS.length)
    const card = CANAL_TREASURE_CARDS[cardIndex]
    
    this.addGameEvent('drawCard', {
      playerId: player.id,
      cardType: 'treasure',
      card: card
    })
    
    await this.executeCardAction(player, card)
    
    return {
      type: 'treasure',
      card: card,
      playerId: player.id
    }
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
          player.money += 2000 // {{ AURA-X: Modify - 调整经过起点奖励以适应新的经济规模 }}
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
        // 下次收取租金时翻倍
        player.buffs.push({
          type: 'doubleRent',
          remaining: 1,
          value: 100
        })
        break
      
      case 'getShip':
        // 获得运河船只
        player.hasShip = true
        this.addGameEvent('shipAcquired', {
          playerId: player.id,
          message: '获得运河船只，解锁航运模式'
        })
        break
      
      case 'propertyAppreciation':
        // 所有地产价值上涨10%
        this.board.forEach(property => {
          if (property.owner === player.id && property.price > 0) {
            property.appreciatedValue = Math.floor(property.price * 0.1)
          }
        })
        break
      
      case 'cultureBonus':
        // 如果拥有博物馆类地产，额外获得奖励
        const hasMuseum = this.board.some(p => 
          p.owner === player.id && 
          (p.name.includes('博物馆') || p.name.includes('纪念馆'))
        )
        if (hasMuseum) {
          player.money += card.amount
        }
        break
      
      case 'canalBonus':
        // 运河相关地产租金提升
        player.buffs.push({
          type: 'canalBonus',
          remaining: 5,
          value: 20
        })
        break
      
      case 'goToJail':
        this.sendToJail(player)
        break
      
      case 'floodTax':
        // 洪泽湖区地产支付防洪费
        const floodProperties = this.board.filter(p => 
          p.owner === player.id && 
          (p.name.includes('洪泽') || p.name.includes('湖'))
        )
        const totalTax = floodProperties.length * card.amount
        player.money = Math.max(0, player.money - totalTax)
        break
      
      case 'getFoodBuff':
        // 获得淮扬菜美食buff
        player.buffs.push({
          type: 'fineImmunity',
          remaining: 1,
          value: 100
        })
        break
      
      case 'taxRelief':
        // 下次税费减半
        player.buffs.push({
          type: 'taxRelief',
          remaining: 1,
          value: 50
        })
        break
      
      case 'buildDiscount':
        // 建造房屋成本减半（一次）
        player.buffs.push({
          type: 'buildDiscount',
          remaining: 1,
          value: 50
        })
        break
      
      case 'extraMove':
        // 下次移动额外前进格数
        player.buffs.push({
          type: 'extraMove',
          remaining: 1,
          value: card.amount
        })
        break
      
      case 'rentBonus':
        // 租金收入增加
        player.buffs.push({
          type: 'rentBonus',
          remaining: card.duration || 3,
          value: card.amount
        })
        break
      
      case 'immunity':
        // 免疫下次监狱或罚款
        player.buffs.push({
          type: 'immunity',
          remaining: 1,
          value: 100
        })
        break
      
      case 'forceTrade':
        // 与任意玩家强制交易一次
        player.buffs.push({
          type: 'forceTrade',
          remaining: 1,
          value: 100
        })
        break
      
      case 'foresight':
        // 预知下次骰子结果
        player.buffs.push({
          type: 'foresight',
          remaining: 1,
          value: 100
        })
        break
      
      case 'stockBonus':
        // 股票投资收益翻倍
        player.buffs.push({
          type: 'stockBonus',
          remaining: card.duration || 3,
          value: card.amount || 100
        })
        break
      
      case 'nothing':
        // 什么也不做
        break
    }
  }

  async payTax(player, property) {
    let taxAmount = property.id === '4' ? 200 : 750 // 所得税或奢侈税
    
    // 检查税收减免buff
    const taxReliefBuff = player.buffs.find(b => b.type === 'taxRelief' && b.remaining > 0)
    if (taxReliefBuff) {
      taxAmount = Math.floor(taxAmount * (1 - taxReliefBuff.value / 100))
      taxReliefBuff.remaining--
    }
    
    // 检查免疫buff
    const immunityBuff = player.buffs.find(b => b.type === 'immunity' && b.remaining > 0)
    if (immunityBuff) {
      taxAmount = 0
      immunityBuff.remaining--
      this.addGameEvent('buffUsed', {
        playerId: player.id,
        buffType: 'immunity',
        message: '免疫了税收！'
      })
    }
    
    player.money = Math.max(0, player.money - taxAmount)
    
    this.addGameEvent('payTax', {
      playerId: player.id,
      propertyId: property.id,
      amount: taxAmount
    })
    
    if (player.money === 0) {
      this.handleBankruptcy(player)
    }
    
    return {
      type: 'tax',
      amount: taxAmount,
      propertyName: property.name,
      playerId: player.id
    }
  }

  // 减少buff持续时间
  decreaseBuffDuration(player) {
    if (player.buffs) {
      player.buffs = player.buffs.filter(buff => {
        if (buff.remaining > 0) {
          return true
        }
        return false
      })
    }
  }

  // 每回合结束时处理垄断组特殊效果
  processMonopolyEffects(player) {
    if (!player.monopolies) return
    
    player.monopolies.forEach(group => {
      const effect = GROUP_MONOPOLY_EFFECTS[group]
      if (!effect) return
      
      switch (effect.bonus) {
        case 20: // 伟人故里：每回合额外获得20元文化津贴
          if (group === 'lightblue') {
            player.money += 20
            this.addGameEvent('monopolyBonus', {
              playerId: player.id,
              group: group,
              amount: 20,
              message: '伟人故里文化津贴'
            })
          }
          break
        
        case 'food_income': // 淮扬美食：每回合随机获得50-200元美食收入
          if (group === 'orange') {
            const income = Math.floor(Math.random() * 151) + 50 // 50-200
            player.money += income
            this.addGameEvent('monopolyBonus', {
              playerId: player.id,
              group: group,
              amount: income,
              message: '淮扬美食收入'
            })
          }
          break
        
        case 'eco_bonus': // 生态旅游：每3回合获得300元生态奖励
          if (group === 'yellow') {
            if (!player.ecoTurnCounter) player.ecoTurnCounter = 0
            player.ecoTurnCounter++
            if (player.ecoTurnCounter >= 3) {
              player.money += 300
              player.ecoTurnCounter = 0
              this.addGameEvent('monopolyBonus', {
                playerId: player.id,
                group: group,
                amount: 300,
                message: '生态旅游奖励'
              })
            }
          }
          break
      }
    })
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
    // 处理当前玩家的回合结束效果
    const currentPlayer = this.getCurrentPlayer()
    if (currentPlayer) {
      this.decreaseBuffDuration(currentPlayer)
      this.processMonopolyEffects(currentPlayer)
    }
    
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

  // 完成回合，确保事件处理完毕后才切换玩家
  finishTurn() {
    // 检查是否需要结束拍卖
    if (this.auctionData.isActive && this.auctionData.timeRemaining <= 0) {
      this.endAuction()
    }
    
    // 只有在当前玩家还是轮到他时才切换
    const currentPlayer = this.getCurrentPlayer()
    if (currentPlayer && this.currentPlayerIndex < this.players.length) {
      this.nextTurn()
    }
    return this.getState()
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
        isOnline: p.isOnline,
        hasShip: p.hasShip,
        buffs: p.buffs,
        monopolies: p.monopolies
      })),
      currentPlayer: this.currentPlayerIndex,
      phase: this.phase,
      board: this.board,
      dice: this.dice,
      turn: this.turn,
      winner: this.winner,
      gameEvents: this.gameEvents.slice(-10), // 只返回最近10个事件
      auctionData: this.auctionData,
      stockData: this.stockData
    }
  }

  // 拍卖系统方法
  async startAuction(propertyId, startingBid = 0) {
    if (this.auctionData.isActive) {
      throw new Error('拍卖已在进行中')
    }

    const property = this.board.find(p => p.id === propertyId)
    if (!property) {
      throw new Error('地产不存在')
    }

    this.auctionData = {
      isActive: true,
      propertyId: propertyId,
      currentBid: startingBid,
      highestBidder: null,
      participants: [],
      timeRemaining: 60, // 60秒拍卖时间
      startTime: Date.now()
    }

    this.addGameEvent('auctionStart', {
      propertyId: propertyId,
      propertyName: property.name,
      startingBid: startingBid
    })

    // 开始拍卖倒计时
    this.auctionTimer = setInterval(() => {
      this.auctionData.timeRemaining--
      if (this.auctionData.timeRemaining <= 0) {
        this.endAuction()
      }
    }, 1000)

    return this.auctionData
  }

  async placeBid(playerId, bidAmount) {
    if (!this.auctionData.isActive) {
      throw new Error('当前没有拍卖进行中')
    }

    const player = this.getPlayer(playerId)
    if (!player) {
      throw new Error('玩家不存在')
    }

    if (player.money < bidAmount) {
      throw new Error('资金不足')
    }

    if (bidAmount <= this.auctionData.currentBid) {
      throw new Error('出价必须高于当前最高价')
    }

    this.auctionData.currentBid = bidAmount
    this.auctionData.highestBidder = playerId

    // 添加参与者
    if (!this.auctionData.participants.includes(playerId)) {
      this.auctionData.participants.push(playerId)
    }

    this.addGameEvent('bid', {
      playerId: playerId,
      playerName: player.name,
      bidAmount: bidAmount,
      propertyId: this.auctionData.propertyId
    })

    return this.auctionData
  }

  async endAuction() {
    if (!this.auctionData.isActive) {
      return
    }

    clearInterval(this.auctionTimer)

    if (this.auctionData.highestBidder) {
      const winner = this.getPlayer(this.auctionData.highestBidder)
      const property = this.board.find(p => p.id === this.auctionData.propertyId)
      
      // 扣除资金并转让地产
      winner.money -= this.auctionData.currentBid
      property.owner = this.auctionData.highestBidder
      winner.properties.push(this.auctionData.propertyId)

      // 检查垄断
      this.checkMonopoly(winner)

      this.addGameEvent('auctionEnd', {
        winnerId: this.auctionData.highestBidder,
        winnerName: winner.name,
        finalBid: this.auctionData.currentBid,
        propertyId: this.auctionData.propertyId,
        propertyName: property.name
      })
    } else {
      this.addGameEvent('auctionEnd', {
        winnerId: null,
        message: '无人出价，拍卖流拍'
      })
    }

    // 重置拍卖数据
    this.auctionData = {
      isActive: false,
      propertyId: null,
      currentBid: 0,
      highestBidder: null,
      participants: [],
      timeRemaining: 0,
      startTime: null
    }

    await this.save()
  }

  // 抵押系统方法
  async mortgageProperty(playerId, propertyId) {
    const player = this.getPlayer(playerId)
    const property = this.board.find(p => p.id === propertyId)

    if (!player || !property) {
      throw new Error('玩家或地产不存在')
    }

    if (property.owner !== playerId) {
      throw new Error('您不拥有此地产')
    }

    if (property.mortgaged) {
      throw new Error('地产已被抵押')
    }

    if (property.houses > 0 || property.hotels > 0) {
      throw new Error('请先出售所有房屋和酒店')
    }

    const mortgageValue = Math.floor(property.price * 0.5)
    player.money += mortgageValue
    property.mortgaged = true

    this.mortgageData.mortgagedProperties.set(propertyId, {
      originalOwner: playerId,
      mortgageValue: mortgageValue,
      mortgageDate: Date.now(),
      interestAccrued: 0
    })

    this.addGameEvent('mortgage', {
      playerId: playerId,
      propertyId: propertyId,
      propertyName: property.name,
      mortgageValue: mortgageValue
    })

    await this.save()
    return mortgageValue
  }

  async redeemProperty(playerId, propertyId) {
    const player = this.getPlayer(playerId)
    const property = this.board.find(p => p.id === propertyId)
    const mortgageInfo = this.mortgageData.mortgagedProperties.get(propertyId)

    if (!player || !property || !mortgageInfo) {
      throw new Error('玩家、地产或抵押信息不存在')
    }

    if (mortgageInfo.originalOwner !== playerId) {
      throw new Error('您不是此地产的原拥有者')
    }

    const timePassed = (Date.now() - mortgageInfo.mortgageDate) / (1000 * 60 * 60 * 24) // 天数
    const interest = Math.floor(mortgageInfo.mortgageValue * this.mortgageData.interestRate * timePassed / 365)
    const redeemCost = mortgageInfo.mortgageValue + interest

    if (player.money < redeemCost) {
      throw new Error('资金不足，无法赎回地产')
    }

    player.money -= redeemCost
    property.mortgaged = false
    this.mortgageData.mortgagedProperties.delete(propertyId)

    this.addGameEvent('redeem', {
      playerId: playerId,
      propertyId: propertyId,
      propertyName: property.name,
      redeemCost: redeemCost,
      interest: interest
    })

    await this.save()
    return redeemCost
  }

  // 股票交易系统方法
  async buyStock(playerId, stockId, quantity) {
    const player = this.getPlayer(playerId)
    const stock = this.stockData.stocks.find(s => s.id === stockId)

    if (!player || !stock) {
      throw new Error('玩家或股票不存在')
    }

    let totalCost = stock.price * quantity
    
    // 检查股票投资buff
    const stockBuff = player.buffs.find(b => b.type === 'stockBonus' && b.remaining > 0)
    if (stockBuff) {
      totalCost = Math.floor(totalCost * 0.8) // 20%折扣
      stockBuff.remaining--
      this.addGameEvent('buffUsed', {
        playerId: player.id,
        buffType: 'stockBonus',
        message: '使用了股票投资buff！'
      })
    }
    
    if (player.money < totalCost) {
      throw new Error('资金不足')
    }

    player.money -= totalCost
    
    // 更新玩家股票持有量
    const playerStocks = this.stockData.playerStocks.get(playerId) || {}
    playerStocks[stockId] = (playerStocks[stockId] || 0) + quantity
    this.stockData.playerStocks.set(playerId, playerStocks)

    // 更新股票价格（简单的供需模型）
    stock.volume += quantity
    this.updateStockPrice(stock, 'buy', quantity)

    this.addGameEvent('stockBuy', {
      playerId: playerId,
      stockId: stockId,
      stockName: stock.name,
      quantity: quantity,
      price: stock.price,
      totalCost: totalCost
    })

    await this.save()
    return { quantity, totalCost }
  }

  async sellStock(playerId, stockId, quantity) {
    const player = this.getPlayer(playerId)
    const stock = this.stockData.stocks.find(s => s.id === stockId)
    const playerStocks = this.stockData.playerStocks.get(playerId) || {}

    if (!player || !stock) {
      throw new Error('玩家或股票不存在')
    }

    if (!playerStocks[stockId] || playerStocks[stockId] < quantity) {
      throw new Error('股票持有量不足')
    }

    let totalValue = stock.price * quantity
    
    // 检查股票投资buff
    const stockBuff = player.buffs.find(b => b.type === 'stockBonus' && b.remaining > 0)
    if (stockBuff) {
      totalValue = Math.floor(totalValue * 1.2) // 20%收益加成
      stockBuff.remaining--
      this.addGameEvent('buffUsed', {
        playerId: player.id,
        buffType: 'stockBonus',
        message: '使用了股票投资buff，收益增加！'
      })
    }
    
    player.money += totalValue
    playerStocks[stockId] -= quantity

    if (playerStocks[stockId] === 0) {
      delete playerStocks[stockId]
    }

    // 更新股票价格
    stock.volume -= quantity
    this.updateStockPrice(stock, 'sell', quantity)

    this.addGameEvent('stockSell', {
      playerId: playerId,
      stockId: stockId,
      stockName: stock.name,
      quantity: quantity,
      price: stock.price,
      totalValue: totalValue
    })

    await this.save()
    return { quantity, totalValue }
  }

  updateStockPrice(stock, action, quantity) {
    const priceChange = Math.floor(quantity * 0.5) // 每股影响0.5元
    
    if (action === 'buy') {
      stock.price += priceChange
      stock.trend = 'up'
    } else {
      stock.price = Math.max(10, stock.price - priceChange) // 最低10元
      stock.trend = 'down'
    }

    // 随机市场波动
    if (Math.random() < 0.3) {
      const randomChange = Math.floor(Math.random() * 10) - 5
      stock.price = Math.max(10, stock.price + randomChange)
    }
  }

  // 获取玩家股票持有情况
  getPlayerStocks(playerId) {
    return this.stockData.playerStocks.get(playerId) || {}
  }

  // 计算玩家股票总价值
  calculateStockValue(playerId) {
    const playerStocks = this.getPlayerStocks(playerId)
    let totalValue = 0

    for (const [stockId, quantity] of Object.entries(playerStocks)) {
      const stock = this.stockData.stocks.find(s => s.id === stockId)
      if (stock) {
        totalValue += stock.price * quantity
      }
    }

    return totalValue
  }
}

module.exports = Game