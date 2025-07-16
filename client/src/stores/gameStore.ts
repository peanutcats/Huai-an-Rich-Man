import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import { ElNotification } from 'element-plus'
import type { GameState, Player, Property, Room, ChatMessage, TradeOffer } from '@/types'

export const useGameStore = defineStore('game', () => {
  const socket = ref<Socket | null>(null)
  const gameState = ref<GameState | null>(null)
  const currentRoom = ref<Room | null>(null)
  const currentPlayer = ref<Player | null>(null)
  const chatMessages = ref<ChatMessage[]>([])
  const tradeOffers = ref<TradeOffer[]>([])
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const myPlayer = computed(() => {
    if (!gameState.value || !currentPlayer.value) return null
    return gameState.value.players.find(p => p.id === currentPlayer.value!.id)
  })

  const isMyTurn = computed(() => {
    if (!gameState.value || !myPlayer.value) return false
    return gameState.value.players[gameState.value.currentPlayer]?.id === myPlayer.value.id
  })

  const canRollDice = computed(() => {
    return isMyTurn.value && gameState.value?.phase === 'playing'
  })

  function initializeSocket() {
    if (socket.value) return

    console.log('正在连接到服务器: http://localhost:8081')
    socket.value = io('http://localhost:8081')
    
    socket.value.on('connect', () => {
      console.log('Socket.IO 连接成功')
      isConnected.value = true
      error.value = null
    })

    socket.value.on('disconnect', () => {
      console.log('Socket.IO 连接断开')
      isConnected.value = false
    })

    socket.value.on('error', (err) => {
      console.error('Socket.IO 连接错误:', err)
      error.value = err.message
    })

    socket.value.on('connect_error', (err) => {
      console.error('Socket.IO 连接失败:', err)
      error.value = err.message
      isConnected.value = false
    })

    socket.value.on('gameState', (state: GameState) => {
      gameState.value = state
    })

    socket.value.on('roomUpdate', (room: Room) => {
      currentRoom.value = room
    })

    socket.value.on('playerJoined', (player: Player) => {
      if (currentRoom.value) {
        const existingIndex = currentRoom.value.players.findIndex(p => p.id === player.id)
        if (existingIndex >= 0) {
          currentRoom.value.players[existingIndex] = player
        } else {
          currentRoom.value.players.push(player)
        }
      }
    })

    socket.value.on('playerLeft', (playerId: string) => {
      if (currentRoom.value) {
        currentRoom.value.players = currentRoom.value.players.filter(p => p.id !== playerId)
      }
    })

    socket.value.on('chatMessage', (message: ChatMessage) => {
      chatMessages.value.push(message)
    })

    socket.value.on('tradeOffer', (offer: TradeOffer) => {
      tradeOffers.value.push(offer)
    })

    socket.value.on('tradeResponse', (response: { offerId: string; status: string }) => {
      const offer = tradeOffers.value.find(o => o.id === response.offerId)
      if (offer) {
        offer.status = response.status as any
      }
    })

    socket.value.on('gameEnded', (winner: string) => {
      if (gameState.value) {
        gameState.value.winner = winner
        gameState.value.phase = 'ended'
      }
    })

    socket.value.on('propertyPurchased', (data: { playerId: string; propertyId: string; propertyName: string; playerName: string; price: number }) => {
      // 显示购买通知
      ElNotification({
        title: '🏘️ 地产购买',
        message: `${data.playerName} 购买了 ${data.propertyName}，花费 ¥${data.price.toLocaleString()}`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('playerEvent', (eventData: any) => {
      // 转发事件数据给前端处理
      if (window.handlePlayerEvent) {
        window.handlePlayerEvent(eventData)
      }
    })

    socket.value.on('houseBuilt', (data: { playerId: string; propertyId: string; propertyName: string; playerName: string; price: number; houses: number }) => {
      // 显示建造通知
      ElNotification({
        title: '🏠 房屋建造',
        message: `${data.playerName} 在 ${data.propertyName} 建造了房屋，花费 ¥${data.price.toLocaleString()}，现有${data.houses}栋房屋`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('turnCompleted', (data: { playerId: string }) => {
      // 回合完成通知
      console.log(`玩家 ${data.playerId} 完成回合`)
    })

    // 金融系统事件监听
    socket.value.on('auctionStarted', (auctionData: any) => {
      ElNotification({
        title: '🔨 拍卖开始',
        message: `${auctionData.propertyName} 开始拍卖！起拍价：¥${auctionData.currentBid.toLocaleString()}`,
        type: 'info',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('bidPlaced', (auctionData: any) => {
      ElNotification({
        title: '💰 新的出价',
        message: `当前最高出价：¥${auctionData.currentBid.toLocaleString()}`,
        type: 'warning',
        duration: 2000,
        position: 'top-right'
      })
    })

    socket.value.on('auctionEnded', (data: any) => {
      if (data.winnerId) {
        ElNotification({
          title: '🎉 拍卖结束',
          message: `${data.winnerName} 以 ¥${data.finalBid.toLocaleString()} 拍得 ${data.propertyName}`,
          type: 'success',
          duration: 4000,
          position: 'top-right'
        })
      } else {
        ElNotification({
          title: '❌ 拍卖流拍',
          message: data.message,
          type: 'info',
          duration: 3000,
          position: 'top-right'
        })
      }
    })

    socket.value.on('propertyMortgaged', (data: { propertyId: string; mortgageValue: number }) => {
      ElNotification({
        title: '🏦 抵押成功',
        message: `地产抵押成功，获得 ¥${data.mortgageValue.toLocaleString()}`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('propertyRedeemed', (data: { propertyId: string; redeemCost: number }) => {
      ElNotification({
        title: '🔑 赎回成功',
        message: `地产赎回成功，花费 ¥${data.redeemCost.toLocaleString()}`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('stockBought', (data: { stockId: string; quantity: number; totalCost: number }) => {
      ElNotification({
        title: '📈 股票购买',
        message: `成功购买 ${data.quantity} 股，花费 ¥${data.totalCost.toLocaleString()}`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('stockSold', (data: { stockId: string; quantity: number; totalValue: number }) => {
      ElNotification({
        title: '📉 股票出售',
        message: `成功出售 ${data.quantity} 股，获得 ¥${data.totalValue.toLocaleString()}`,
        type: 'success',
        duration: 3000,
        position: 'top-right'
      })
    })

    socket.value.on('stockData', (data: { stocks: any[]; playerStocks: any; stockValue: number }) => {
      // 股票数据更新，可以在这里处理股票信息的显示
      console.log('股票数据更新:', data)
    })
  }

  function joinRoom(roomId: string, playerName: string) {
    if (!socket.value) return
    
    isLoading.value = true
    socket.value.emit('joinRoom', { roomId, playerName })
    
    socket.value.once('joinRoomSuccess', (data: { player: Player; room: Room }) => {
      currentPlayer.value = data.player
      currentRoom.value = data.room
      isLoading.value = false
    })

    socket.value.once('joinRoomError', (error: string) => {
      error.value = error
      isLoading.value = false
    })
  }

  function createRoom(roomName: string, playerName: string) {
    if (!socket.value) return
    
    isLoading.value = true
    socket.value.emit('createRoom', { roomName, playerName })
    
    socket.value.once('createRoomSuccess', (data: { player: Player; room: Room }) => {
      currentPlayer.value = data.player
      currentRoom.value = data.room
      isLoading.value = false
    })

    socket.value.once('createRoomError', (error: string) => {
      error.value = error
      isLoading.value = false
    })
  }

  function startGame() {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('startGame', { roomId: currentRoom.value.id })
  }

  function rollDice() {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('rollDice', { roomId: currentRoom.value.id })
  }

  function buyProperty(propertyId: string) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('buyProperty', { roomId: currentRoom.value.id, propertyId })
  }

  function buildHouse(propertyId: string) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('buildHouse', { roomId: currentRoom.value.id, propertyId })
  }

  function sendChatMessage(message: string) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('chatMessage', { roomId: currentRoom.value.id, message })
  }

  function sendTradeOffer(offer: Omit<TradeOffer, 'id' | 'status' | 'createdAt'>) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('tradeOffer', { roomId: currentRoom.value.id, ...offer })
  }

  function respondToTrade(offerId: string, accept: boolean) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('tradeResponse', { 
      roomId: currentRoom.value.id, 
      offerId, 
      accept 
    })
  }

  function leaveRoom() {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('leaveRoom', { roomId: currentRoom.value.id })
    currentRoom.value = null
    currentPlayer.value = null
    gameState.value = null
    chatMessages.value = []
    tradeOffers.value = []
  }

  function confirmEvent() {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('confirmEvent', { roomId: currentRoom.value.id })
  }

  function clearError() {
    error.value = null
  }

  // 金融系统方法
  function startAuction(propertyId: string, startingBid: number = 0) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('startAuction', { propertyId, startingBid })
  }

  function placeBid(bidAmount: number) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('placeBid', { bidAmount })
  }

  function mortgageProperty(propertyId: string) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('mortgageProperty', { propertyId })
  }

  function redeemProperty(propertyId: string) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('redeemProperty', { propertyId })
  }

  function buyStock(stockId: string, quantity: number) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('buyStock', { stockId, quantity })
  }

  function sellStock(stockId: string, quantity: number) {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('sellStock', { stockId, quantity })
  }

  function getStockData() {
    if (!socket.value || !currentRoom.value) return
    socket.value.emit('getStockData')
  }

  return {
    socket,
    gameState,
    currentRoom,
    currentPlayer,
    chatMessages,
    tradeOffers,
    isConnected,
    isLoading,
    error,
    myPlayer,
    isMyTurn,
    canRollDice,
    initializeSocket,
    joinRoom,
    createRoom,
    startGame,
    rollDice,
    buyProperty,
    buildHouse,
    sendChatMessage,
    sendTradeOffer,
    respondToTrade,
    leaveRoom,
    confirmEvent,
    clearError,
    // 金融系统方法
    startAuction,
    placeBid,
    mortgageProperty,
    redeemProperty,
    buyStock,
    sellStock,
    getStockData
  }
})