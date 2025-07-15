<template>
  <div class="game-board-container">
    <!-- 游戏板 -->
    <div class="game-board">
      <!-- 地产格子 -->
      <div 
        v-for="property in boardProperties" 
        :key="property.id"
        class="property-cell"
        :class="[
          `position-${property.position}`,
          property.group,
          { 
            'owned': property.owner,
            'owned-by-current': property.owner === gameStore.myPlayer?.id 
          }
        ]"
        :style="getPropertyStyle(property)"
        @click="handlePropertyClick(property)"
      >
        <div class="property-name">{{ property.name }}</div>
        <div v-if="property.price > 0" class="property-price">¥{{ property.price }}</div>
        <div v-if="property.houses > 0" class="property-houses">
          🏠 × {{ property.houses }}
        </div>
      </div>

      <!-- 玩家棋子 -->
      <div 
        v-for="player in gameStore.gameState?.players" 
        :key="player.id"
        class="player-piece"
        :class="`player-${getPlayerIndex(player.id) + 1}`"
        :style="getPlayerStyle(player)"
      >
        {{ player.name.charAt(0) }}
      </div>

      <!-- 中央区域 -->
      <div class="center-area">
        <div class="game-logo">
          <h2>🏛️</h2>
          <h3>淮安大富翁</h3>
        </div>
        
        <!-- 骰子区域 -->
        <div class="dice-container">
          <div class="dice" v-if="gameStore.gameState?.dice">
            {{ gameStore.gameState.dice[0] }}
          </div>
          <div class="dice" v-if="gameStore.gameState?.dice">
            {{ gameStore.gameState.dice[1] }}
          </div>
        </div>
        
        <!-- 当前玩家信息 -->
        <div class="current-turn" v-if="currentPlayer">
          <div class="turn-info">
            轮到: {{ currentPlayer.name }}
          </div>
          <el-button 
            v-if="gameStore.canRollDice" 
            type="primary"
            @click="rollDice"
            :loading="rolling"
            size="large"
          >
            🎲 掷骰子
          </el-button>
        </div>
      </div>
    </div>

    <!-- 游戏信息面板 -->
    <div class="game-info-panel">
      <!-- 玩家状态 -->
      <el-card class="players-status">
        <template #header>
          <h3>👥 玩家状态</h3>
        </template>
        
        <div class="player-list">
          <div 
            v-for="(player, index) in gameStore.gameState?.players" 
            :key="player.id"
            class="player-status"
            :class="{ 
              'current-player': index === gameStore.gameState?.currentPlayer,
              'my-player': player.id === gameStore.myPlayer?.id 
            }"
          >
            <div class="player-avatar" :style="{ backgroundColor: player.color }">
              {{ player.name.charAt(0) }}
            </div>
            <div class="player-details">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-money">💰 ¥{{ player.money.toLocaleString() }}</div>
              <div class="player-properties">🏘️ {{ player.properties.length }}处地产</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 当前地产信息 -->
      <el-card v-if="selectedProperty" class="property-info">
        <template #header>
          <h3>🏘️ 地产信息</h3>
        </template>
        
        <div class="property-details">
          <h4>{{ selectedProperty.name }}</h4>
          <p class="property-description">{{ selectedProperty.description }}</p>
          
          <div class="property-stats">
            <div class="stat-item">
              <span class="stat-label">价格:</span>
              <span class="stat-value">¥{{ selectedProperty.price.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">租金:</span>
              <span class="stat-value">¥{{ selectedProperty.rent.toLocaleString() }}</span>
            </div>
            <div v-if="selectedProperty.owner" class="stat-item">
              <span class="stat-label">拥有者:</span>
              <span class="stat-value">{{ getPlayerName(selectedProperty.owner) }}</span>
            </div>
          </div>

          <!-- 文化信息 -->
          <div v-if="selectedProperty.culture" class="culture-info">
            <h5>🏛️ 文化背景</h5>
            <p>{{ selectedProperty.culture }}</p>
          </div>

          <!-- 金融提示 -->
          <div v-if="selectedProperty.financialTip" class="financial-tip">
            <h5>💡 金融常识</h5>
            <p>{{ selectedProperty.financialTip }}</p>
          </div>

          <!-- 购买按钮 -->
          <div v-if="canBuyProperty(selectedProperty)" class="property-actions">
            <el-button 
              type="primary" 
              @click="buyProperty(selectedProperty.id)"
              :loading="purchasing"
            >
              购买地产 (¥{{ selectedProperty.price.toLocaleString() }})
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 聊天区域 -->
      <el-card class="chat-panel">
        <template #header>
          <h3>💬 游戏聊天</h3>
        </template>
        
        <div class="chat-messages" ref="chatContainer">
          <div 
            v-for="message in gameStore.chatMessages.slice(-10)" 
            :key="message.id"
            class="chat-message"
          >
            <span class="message-author">{{ message.playerName }}:</span>
            <span class="message-text">{{ message.message }}</span>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="chatMessage"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            size="small"
          >
            <template #append>
              <el-button @click="sendMessage" size="small">发送</el-button>
            </template>
          </el-input>
        </div>
      </el-card>
    </div>

    <!-- 游戏结束对话框 -->
    <el-dialog
      v-model="showGameEnd"
      title="🎉 游戏结束"
      width="400px"
      center
      :close-on-click-modal="false"
    >
      <div class="game-end-content">
        <h3>获胜者: {{ winnerName }}</h3>
        <p>恭喜获得胜利！</p>
        <div class="final-rankings">
          <h4>最终排名:</h4>
          <ol>
            <li v-for="player in finalRankings" :key="player.id">
              {{ player.name }} - ¥{{ player.money.toLocaleString() }}
            </li>
          </ol>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="backToRoom">返回房间</el-button>
        <el-button type="primary" @click="backToHome">回到首页</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { HUAIAN_PROPERTIES, getPropertyColor, calculateRent } from '@/utils/gameData'
import type { Property, Player } from '@/types'

const router = useRouter()
const gameStore = useGameStore()

const selectedProperty = ref<Property | null>(null)
const chatMessage = ref('')
const rolling = ref(false)
const purchasing = ref(false)
const showGameEnd = ref(false)

const boardProperties = computed(() => HUAIAN_PROPERTIES)

const currentPlayer = computed(() => {
  if (!gameStore.gameState) return null
  return gameStore.gameState.players[gameStore.gameState.currentPlayer]
})

const winnerName = computed(() => {
  if (!gameStore.gameState?.winner) return ''
  return gameStore.gameState.players.find(p => p.id === gameStore.gameState?.winner)?.name || ''
})

const finalRankings = computed(() => {
  if (!gameStore.gameState) return []
  return [...gameStore.gameState.players].sort((a, b) => b.money - a.money)
})

const getPropertyStyle = (property: Property) => {
  const position = property.position
  const boardSize = 800
  const cellSize = 80
  const radius = (boardSize - cellSize) / 2

  let x, y, rotation = 0

  if (position <= 10) {
    // 底边
    x = boardSize - cellSize - (position * cellSize)
    y = boardSize - cellSize
  } else if (position <= 20) {
    // 左边
    x = 0
    y = boardSize - cellSize - ((position - 10) * cellSize)
    rotation = 90
  } else if (position <= 30) {
    // 顶边
    x = (position - 20) * cellSize
    y = 0
    rotation = 180
  } else {
    // 右边
    x = boardSize - cellSize
    y = (position - 30) * cellSize
    rotation = 270
  }

  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    transform: `rotate(${rotation}deg)`,
    backgroundColor: getPropertyColor(property.group),
    borderColor: property.owner ? '#4CAF50' : '#ddd'
  }
}

const getPlayerStyle = (player: Player) => {
  const position = player.position
  const property = HUAIAN_PROPERTIES.find(p => p.position === position)
  if (!property) return {}

  const propertyStyle = getPropertyStyle(property)
  const offset = getPlayerIndex(player.id) * 5

  return {
    left: `calc(${propertyStyle.left} + ${offset}px)`,
    top: `calc(${propertyStyle.top} + ${offset}px)`,
    backgroundColor: player.color
  }
}

const getPlayerIndex = (playerId: string) => {
  return gameStore.gameState?.players.findIndex(p => p.id === playerId) || 0
}

const getPlayerName = (playerId: string) => {
  return gameStore.gameState?.players.find(p => p.id === playerId)?.name || '未知'
}

const handlePropertyClick = (property: Property) => {
  selectedProperty.value = property
}

const canBuyProperty = (property: Property) => {
  return !property.owner && 
         property.price > 0 && 
         gameStore.myPlayer && 
         gameStore.myPlayer.money >= property.price &&
         gameStore.myPlayer.position === property.position
}

const rollDice = async () => {
  rolling.value = true
  try {
    await gameStore.rollDice()
  } finally {
    rolling.value = false
  }
}

const buyProperty = async (propertyId: string) => {
  purchasing.value = true
  try {
    await gameStore.buyProperty(propertyId)
    selectedProperty.value = null
  } finally {
    purchasing.value = false
  }
}

const sendMessage = () => {
  if (chatMessage.value.trim()) {
    gameStore.sendChatMessage(chatMessage.value.trim())
    chatMessage.value = ''
  }
}

const backToRoom = () => {
  router.push(`/room/${gameStore.currentRoom?.id}`)
}

const backToHome = () => {
  gameStore.leaveRoom()
  router.push('/')
}

// 监听游戏结束
watch(() => gameStore.gameState?.phase, (phase) => {
  if (phase === 'ended') {
    showGameEnd.value = true
  }
})
</script>

<style scoped>
.game-board-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  gap: 20px;
}

.game-board {
  position: relative;
  width: 800px;
  height: 800px;
  background: #f0f8ff;
  border: 4px solid #4a90e2;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.property-cell {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 2px;
  text-align: center;
}

.property-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.property-cell.owned {
  border-color: #4CAF50;
  background: #e8f5e8;
}

.property-cell.owned-by-current {
  border-color: #FFC107;
  background: #fff9c4;
}

.property-name {
  font-size: 9px;
  line-height: 1.1;
  margin-bottom: 2px;
}

.property-price {
  font-size: 8px;
  color: #666;
}

.property-houses {
  font-size: 8px;
  color: #4CAF50;
}

.player-piece {
  position: absolute;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  z-index: 20;
  transition: all 0.5s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.center-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 300px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.game-logo h2 {
  font-size: 3rem;
  margin: 0;
}

.game-logo h3 {
  margin: 5px 0 20px 0;
  color: #333;
}

.dice-container {
  display: flex;
  gap: 15px;
  margin: 20px 0;
}

.dice {
  width: 50px;
  height: 50px;
  background: #fff;
  border: 2px solid #333;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.game-info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 350px;
}

.players-status, .property-info, .chat-panel {
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.player-status {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.player-status.current-player {
  background: #fff3cd;
  border: 2px solid #ffc107;
}

.player-status.my-player {
  background: #d4edda;
  border: 2px solid #28a745;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

.player-details {
  flex: 1;
}

.player-name {
  font-weight: bold;
  margin-bottom: 2px;
}

.player-money, .player-properties {
  font-size: 12px;
  color: #666;
}

.property-details h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.property-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.culture-info, .financial-tip {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #007bff;
}

.culture-info h5, .financial-tip h5 {
  margin: 0 0 8px 0;
  color: #333;
}

.culture-info p, .financial-tip p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #666;
}

.property-actions {
  margin-top: 15px;
}

.chat-messages {
  height: 150px;
  overflow-y: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 10px;
}

.chat-message {
  margin-bottom: 5px;
  font-size: 12px;
}

.message-author {
  font-weight: bold;
  color: #333;
}

.message-text {
  color: #666;
  margin-left: 5px;
}

.game-end-content {
  text-align: center;
}

.final-rankings {
  margin-top: 20px;
  text-align: left;
}

:deep(.el-card__header) {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-bottom: none;
}

:deep(.el-card__header h3) {
  margin: 0;
  font-size: 1rem;
}
</style>