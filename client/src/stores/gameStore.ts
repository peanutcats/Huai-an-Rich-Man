import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
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

    socket.value = io('http://localhost:8080')
    
    socket.value.on('connect', () => {
      isConnected.value = true
      error.value = null
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    socket.value.on('error', (err) => {
      error.value = err.message
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

  function clearError() {
    error.value = null
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
    clearError
  }
})