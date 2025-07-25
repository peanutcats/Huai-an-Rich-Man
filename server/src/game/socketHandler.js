const { v4: uuidv4 } = require('uuid')
const Player = require('../models/Player')
const Room = require('../models/Room')
const Game = require('../game/Game')

// 内存中的房间和游戏状态
const rooms = new Map()
const games = new Map()
const playerSockets = new Map()

function gameSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 新玩家连接: ${socket.id}`)

    // 玩家加入房间
    socket.on('joinRoom', async (data) => {
      try {
        const { roomId, playerName } = data
        
        if (!roomId || !playerName) {
          socket.emit('joinRoomError', '房间ID和玩家名称不能为空')
          return
        }

        // 创建或获取玩家
        const playerId = uuidv4()
        const player = new Player(playerId, playerName, socket.id)
        await player.save()

        // 获取或创建房间
        let room = rooms.get(roomId)
        if (!room) {
          socket.emit('joinRoomError', '房间不存在')
          return
        }

        if (room.isFull()) {
          socket.emit('joinRoomError', '房间已满')
          return
        }

        // 添加玩家到房间
        room.addPlayer(player)
        await room.save()
        
        // 记录玩家socket
        playerSockets.set(playerId, socket.id)
        socket.playerId = playerId
        socket.roomId = roomId

        // 加入socket房间
        socket.join(roomId)

        // 通知所有玩家
        io.to(roomId).emit('playerJoined', player.toJSON())
        io.to(roomId).emit('roomUpdate', room.toJSON())

        // 回复成功
        socket.emit('joinRoomSuccess', {
          player: player.toJSON(),
          room: room.toJSON()
        })

        console.log(`✅ 玩家 ${playerName} 加入房间 ${roomId}`)

      } catch (error) {
        console.error('加入房间错误:', error)
        socket.emit('joinRoomError', error.message)
      }
    })

    // 创建房间
    socket.on('createRoom', async (data) => {
      try {
        const { roomName, playerName } = data
        
        if (!roomName || !playerName) {
          socket.emit('createRoomError', '房间名称和玩家名称不能为空')
          return
        }

        // 创建玩家
        const playerId = uuidv4()
        const player = new Player(playerId, playerName, socket.id)
        await player.save()

        // 创建房间
        const roomId = uuidv4()
        const room = new Room(roomId, roomName, playerId)
        room.addPlayer(player)
        await room.save()

        // 保存到内存
        rooms.set(roomId, room)
        playerSockets.set(playerId, socket.id)
        socket.playerId = playerId
        socket.roomId = roomId

        // 加入socket房间
        socket.join(roomId)

        socket.emit('createRoomSuccess', {
          player: player.toJSON(),
          room: room.toJSON()
        })

        console.log(`🏠 玩家 ${playerName} 创建房间 ${roomName} (${roomId})`)

      } catch (error) {
        console.error('创建房间错误:', error)
        socket.emit('createRoomError', error.message)
      }
    })

    // 开始游戏
    socket.on('startGame', async (data) => {
      try {
        const { roomId } = data
        const room = rooms.get(roomId)
        
        if (!room) {
          socket.emit('error', '房间不存在')
          return
        }

        if (!room.isHost(socket.playerId)) {
          socket.emit('error', '只有房主可以开始游戏')
          return
        }

        if (!room.canStart()) {
          socket.emit('error', '至少需要2名玩家才能开始游戏')
          return
        }

        // 创建游戏实例
        const game = new Game(roomId, room.players)
        games.set(roomId, game)
        
        room.startGame()
        await room.save()

        // 通知所有玩家游戏开始
        io.to(roomId).emit('gameStarted', game.getState())
        io.to(roomId).emit('gameState', game.getState())

        console.log(`🎮 房间 ${roomId} 开始游戏`)

      } catch (error) {
        console.error('开始游戏错误:', error)
        socket.emit('error', error.message)
      }
    })

    // 掷骰子
    socket.on('rollDice', async (data) => {
      try {
        const { roomId } = data
        const game = games.get(roomId)
        
        if (!game) {
          socket.emit('error', '游戏不存在')
          return
        }

        if (!game.isPlayerTurn(socket.playerId)) {
          socket.emit('error', '不是你的回合')
          return
        }

        const result = await game.rollDice(socket.playerId)
        
        // 通知所有玩家
        io.to(roomId).emit('diceRolled', result)
        io.to(roomId).emit('gameState', game.getState())
        
        // 如果有事件，发送事件通知
        if (result.event) {
          io.to(roomId).emit('playerEvent', result.event)
        }
        
        // 如果没有需要用户交互的事件，且不是双数，自动切换回合
        if (!result.needsUserInteraction && !result.isDouble) {
          setTimeout(() => {
            io.to(roomId).emit('gameState', game.getState())
          }, 1000)
        }

        console.log(`🎲 玩家 ${socket.playerId} 掷骰子: ${result.dice}`)

      } catch (error) {
        console.error('掷骰子错误:', error)
        socket.emit('error', error.message)
      }
    })

    // 购买地产
    socket.on('buyProperty', async (data) => {
      try {
        const { roomId, propertyId } = data
        const game = games.get(roomId)
        
        if (!game) {
          socket.emit('error', '游戏不存在')
          return
        }

        const result = await game.buyProperty(socket.playerId, propertyId)
        
        io.to(roomId).emit('propertyPurchased', result)
        io.to(roomId).emit('gameState', game.getState())

        console.log(`🏘️ 玩家 ${socket.playerId} 购买地产 ${propertyId}`)

      } catch (error) {
        console.error('购买地产错误:', error)
        socket.emit('error', error.message)
      }
    })

    // 建造房屋
    socket.on('buildHouse', async (data) => {
      try {
        const { roomId, propertyId } = data
        const game = games.get(roomId)
        
        if (!game) {
          socket.emit('error', '游戏不存在')
          return
        }

        const result = await game.buildHouse(socket.playerId, propertyId)
        
        io.to(roomId).emit('houseBuilt', result)
        io.to(roomId).emit('gameState', game.getState())

        console.log(`🏠 玩家 ${socket.playerId} 在地产 ${propertyId} 建造房屋`)

      } catch (error) {
        console.error('建造房屋错误:', error)
        socket.emit('error', error.message)
      }
    })

    // 事件确认（完成回合）
    socket.on('confirmEvent', async (data) => {
      try {
        const { roomId } = data
        const game = games.get(roomId)
        
        if (!game) {
          socket.emit('error', '游戏不存在')
          return
        }

        if (!game.isPlayerTurn(socket.playerId)) {
          socket.emit('error', '不是你的回合')
          return
        }

        // 如果当前玩家还没有切换，则结束回合
        const updatedState = game.finishTurn()
        
        io.to(roomId).emit('gameState', updatedState)
        io.to(roomId).emit('turnCompleted', { playerId: socket.playerId })

        console.log(`✅ 玩家 ${socket.playerId} 完成回合`)

      } catch (error) {
        console.error('确认事件错误:', error)
        socket.emit('error', error.message)
      }
    })

    // 聊天消息
    socket.on('chatMessage', async (data) => {
      try {
        const { roomId, message } = data
        const room = rooms.get(roomId)
        
        if (!room) return

        const player = room.getPlayer(socket.playerId)
        if (!player) return

        const chatMessage = {
          id: uuidv4(),
          playerId: player.id,
          playerName: player.name,
          message: message,
          timestamp: new Date(),
          type: 'chat'
        }

        io.to(roomId).emit('chatMessage', chatMessage)

      } catch (error) {
        console.error('聊天消息错误:', error)
      }
    })

    // 拒绝购买地产（触发拍卖）
    socket.on('declineProperty', async (data) => {
      try {
        const { roomId, propertyId } = data
        const game = games.get(roomId)
        
        if (!game) {
          socket.emit('error', '游戏不存在')
          return
        }

        // 触发拍卖
        const auctionData = await game.startAuction(propertyId, 0)
        io.to(roomId).emit('auctionStarted', auctionData)
        io.to(roomId).emit('gameState', game.getState())

        console.log(`❌ 玩家 ${socket.playerId} 拒绝购买地产 ${propertyId}，开始拍卖`)

      } catch (error) {
        console.error('拒绝购买地产错误:', error)
        socket.emit('error', error.message)
      }
    })

    // 拍卖系统事件
    socket.on('startAuction', async (data) => {
      try {
        const { propertyId, startingBid } = data
        const game = games.get(socket.roomId)
        
        if (game) {
          const auctionData = await game.startAuction(propertyId, startingBid)
          io.to(socket.roomId).emit('auctionStarted', auctionData)
          io.to(socket.roomId).emit('gameState', game.getState())
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    socket.on('placeBid', async (data) => {
      try {
        const { bidAmount } = data
        const game = games.get(socket.roomId)
        
        if (game) {
          const auctionData = await game.placeBid(socket.playerId, bidAmount)
          io.to(socket.roomId).emit('bidPlaced', auctionData)
          io.to(socket.roomId).emit('gameState', game.getState())
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    // 抵押系统事件
    socket.on('mortgageProperty', async (data) => {
      try {
        const { propertyId } = data
        const game = games.get(socket.roomId)
        
        if (game) {
          const mortgageValue = await game.mortgageProperty(socket.playerId, propertyId)
          socket.emit('propertyMortgaged', { propertyId, mortgageValue })
          io.to(socket.roomId).emit('gameState', game.getState())
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    socket.on('redeemProperty', async (data) => {
      try {
        const { propertyId } = data
        const game = games.get(socket.roomId)
        
        if (game) {
          const redeemCost = await game.redeemProperty(socket.playerId, propertyId)
          socket.emit('propertyRedeemed', { propertyId, redeemCost })
          io.to(socket.roomId).emit('gameState', game.getState())
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    // 股票交易事件
    socket.on('buyStock', async (data) => {
      try {
        const { stockId, quantity } = data
        const game = games.get(socket.roomId)
        
        if (game) {
          const result = await game.buyStock(socket.playerId, stockId, quantity)
          socket.emit('stockBought', { stockId, ...result })
          io.to(socket.roomId).emit('gameState', game.getState())
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    socket.on('sellStock', async (data) => {
      try {
        const { stockId, quantity } = data
        const game = games.get(socket.roomId)
        
        if (game) {
          const result = await game.sellStock(socket.playerId, stockId, quantity)
          socket.emit('stockSold', { stockId, ...result })
          io.to(socket.roomId).emit('gameState', game.getState())
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    socket.on('getStockData', () => {
      try {
        const game = games.get(socket.roomId)
        if (game) {
          socket.emit('stockData', {
            stocks: game.stockData.stocks,
            playerStocks: game.getPlayerStocks(socket.playerId),
            stockValue: game.calculateStockValue(socket.playerId)
          })
        }
      } catch (error) {
        socket.emit('error', error.message)
      }
    })

    // 玩家断开连接
    socket.on('disconnect', () => {
      console.log(`🔌 玩家断开连接: ${socket.id}`)
      
      if (socket.playerId && socket.roomId) {
        const room = rooms.get(socket.roomId)
        if (room) {
          const player = room.getPlayer(socket.playerId)
          if (player) {
            player.isOnline = false
            io.to(socket.roomId).emit('playerDisconnected', socket.playerId)
            io.to(socket.roomId).emit('roomUpdate', room.toJSON())
          }
        }
        
        playerSockets.delete(socket.playerId)
      }
    })

    // 离开房间
    socket.on('leaveRoom', (data) => {
      try {
        const { roomId } = data
        const room = rooms.get(roomId)
        
        if (room && socket.playerId) {
          room.removePlayer(socket.playerId)
          socket.leave(roomId)
          
          io.to(roomId).emit('playerLeft', socket.playerId)
          io.to(roomId).emit('roomUpdate', room.toJSON())
          
          // 如果房间空了，删除房间
          if (room.players.length === 0) {
            rooms.delete(roomId)
            games.delete(roomId)
          }
        }
        
        playerSockets.delete(socket.playerId)

      } catch (error) {
        console.error('离开房间错误:', error)
      }
    })
  })

  // 定期清理离线房间
  setInterval(() => {
    const now = Date.now()
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.length === 0 || (now - room.createdAt.getTime()) > 24 * 60 * 60 * 1000) {
        rooms.delete(roomId)
        games.delete(roomId)
      }
    }
  }, 60 * 60 * 1000) // 每小时清理一次
}

module.exports = gameSocketHandler