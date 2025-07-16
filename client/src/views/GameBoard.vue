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
        <!-- 所有者标识 -->
        <div v-if="property.owner" class="owner-indicator" :style="{ backgroundColor: getOwnerColor(property.owner) }">
          {{ getPlayerName(property.owner).charAt(0) }}
        </div>
        
        <div class="property-name">{{ property.name }}</div>
        <div v-if="property.price > 0" class="property-price">¥{{ property.price }}</div>
        <div v-if="property.houses > 0" class="property-houses">
          🏠 × {{ property.houses }}
        </div>
        
        <!-- 拥有者信息 -->
        <div v-if="property.owner" class="owner-name">
          {{ getPlayerName(property.owner) }}
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
        <!-- 游戏标题 -->
        <div class="game-title-section">
          <div class="game-logo">
            <h2>🏛️</h2>
            <h3>淮安大富翁</h3>
          </div>
        </div>
        
        <!-- 玩家回合信息 -->
        <div class="player-turn-section">
          <div class="turn-info" v-if="currentPlayer">
            轮到: {{ currentPlayer.name }}
          </div>
        </div>
        
        <!-- 游戏状态区域 -->
        <div class="game-state-section">
          <!-- 骰子显示 -->
          <div class="dice-display" v-if="gameStore.gameState?.dice">
            <div class="dice-label">骰子结果:</div>
            <div class="dice-container">
              <div class="dice" :class="{ 'rolling': rolling }">{{ gameStore.gameState.dice[0] }}</div>
              <div class="dice" :class="{ 'rolling': rolling }">{{ gameStore.gameState.dice[1] }}</div>
            </div>
          </div>

          <!-- 占位符，确保按钮始终在底部 -->
          <div class="spacer"></div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              v-if="gameStore.canRollDice"
              type="primary"
              @click="rollDice"
              :loading="rolling"
              size="large"
              class="roll-dice-btn"
            >
              🎲 掷骰子
            </el-button>
          </div>
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
            @click="showPlayerDetails(player)"
          >
            <div class="player-avatar" :style="{ backgroundColor: player.color }">
              {{ player.name.charAt(0) }}
            </div>
            <div class="player-details">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-money">💰 ¥{{ player.money.toLocaleString() }}</div>
              <div class="player-properties">🏘️ {{ player.properties.length }}处地产</div>
              <div class="player-net-worth">💎 总资产: ¥{{ calculatePlayerNetWorth(player).toLocaleString() }}</div>
            </div>
            <div class="view-details-hint">
              <i class="el-icon-view"></i>
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
              <span class="stat-label">基础租金:</span>
              <span class="stat-value">¥{{ selectedProperty.rent.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">实际租金:</span>
              <span class="stat-value">¥{{ calculateRent(selectedProperty).toLocaleString() }}</span>
            </div>
            <div v-if="selectedProperty.houses > 0" class="stat-item">
              <span class="stat-label">房屋数量:</span>
              <span class="stat-value">{{ selectedProperty.houses }}栋</span>
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

    <!-- 玩家详情对话框 -->
    <el-dialog
      v-model="showPlayerDetailsModal"
      :title="`👤 ${selectedPlayer?.name} 的详细信息`"
      width="600px"
      center
    >
      <div v-if="selectedPlayer" class="player-details-content">
        <!-- 基本信息 -->
        <div class="player-basic-info">
          <div class="player-avatar-large" :style="{ backgroundColor: selectedPlayer.color }">
            {{ selectedPlayer.name.charAt(0) }}
          </div>
          <div class="player-info-stats">
            <h3>{{ selectedPlayer.name }}</h3>
            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-label">💰 现金:</span>
                <span class="stat-value">¥{{ selectedPlayer.money.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">🏘️ 地产数量:</span>
                <span class="stat-value">{{ selectedPlayer.properties.length }}处</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">💎 总资产:</span>
                <span class="stat-value">¥{{ calculatePlayerNetWorth(selectedPlayer).toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">📍 当前位置:</span>
                <span class="stat-value">{{ getCurrentPositionName(selectedPlayer.position) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 拥有的地产 -->
        <div class="owned-properties">
          <h4>🏘️ 拥有的地产</h4>
          <div v-if="selectedPlayer.properties.length === 0" class="no-properties">
            该玩家暂无地产
          </div>
          <div v-else class="properties-grid">
            <div 
              v-for="propertyId in selectedPlayer.properties" 
              :key="propertyId"
              class="property-card"
              @click="viewPropertyDetails(propertyId)"
            >
              <div class="property-card-header" :style="{ backgroundColor: getPropertyById(propertyId)?.group ? getPropertyColor(getPropertyById(propertyId).group) : '#ddd' }">
                {{ getPropertyById(propertyId)?.name }}
              </div>
              <div class="property-card-body">
                <div class="property-stat">
                  <span>价格: ¥{{ getPropertyById(propertyId)?.price.toLocaleString() }}</span>
                </div>
                <div class="property-stat">
                  <span>基础租金: ¥{{ getPropertyById(propertyId)?.rent.toLocaleString() }}</span>
                </div>
                <div class="property-stat">
                  <span>实际租金: ¥{{ calculateRent(getPropertyById(propertyId)!).toLocaleString() }}</span>
                </div>
                <div v-if="getPropertyById(propertyId)?.houses > 0" class="property-stat">
                  <span>房屋: 🏠 × {{ getPropertyById(propertyId)?.houses }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showPlayerDetailsModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 事件提示对话框 -->
    <el-dialog
      v-model="showEventDialog"
      :title="eventDialog.title"
      width="500px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="event-dialog-content">
        <div class="event-icon">{{ eventDialog.icon }}</div>
        <div class="event-message">{{ eventDialog.message }}</div>
        <div v-if="eventDialog.description" class="event-description">{{ eventDialog.description }}</div>
      </div>
      
      <template #footer>
        <div class="event-dialog-footer">
          <el-button v-if="eventDialog.type === 'property'" @click="handlePropertyDecline" size="large">
            不购买
          </el-button>
          <el-button 
            v-if="eventDialog.type === 'property'" 
            type="primary" 
            @click="handlePropertyPurchase"
            :loading="purchasing"
            size="large"
          >
            购买 (¥{{ eventDialog.price?.toLocaleString() }})
          </el-button>
          
          <el-button v-if="eventDialog.type === 'upgrade'" @click="handleUpgradeDecline" size="large">
            不升级
          </el-button>
          <el-button 
            v-if="eventDialog.type === 'upgrade'" 
            type="primary" 
            @click="handlePropertyUpgrade"
            :loading="purchasing"
            size="large"
          >
            建造房屋 (¥{{ eventDialog.price?.toLocaleString() }})
          </el-button>
          
          <el-button 
            v-if="eventDialog.type !== 'property' && eventDialog.type !== 'upgrade'" 
            type="primary" 
            @click="handleEventConfirm"
            size="large"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { HUAIAN_PROPERTIES, getPropertyColor, calculateRent } from '@/utils/gameData'
import type { Property, Player } from '@/types'

// 扩展 window 对象类型
declare global {
  interface Window {
    handlePlayerEvent?: (eventData: any) => void
  }
}

const router = useRouter()
const gameStore = useGameStore()

const selectedProperty = ref<Property | null>(null)
const selectedPlayer = ref<Player | null>(null)
const chatMessage = ref('')
const rolling = ref(false)
const purchasing = ref(false)
const showGameEnd = ref(false)
const showPlayerDetailsModal = ref(false)
const showEventDialog = ref(false)
const currentEventProperty = ref<Property | null>(null)

// 事件对话框数据
const eventDialog = ref({
  title: '',
  icon: '',
  message: '',
  description: '',
  type: '',
  price: 0,
  propertyId: ''
})

const boardProperties = computed(() => {
  // 使用游戏状态中的动态board数据，包含拥有者信息
  return gameStore.gameState?.board || HUAIAN_PROPERTIES
})

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
  const property = boardProperties.value.find(p => p.position === position)
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

const getOwnerColor = (playerId: string) => {
  return gameStore.gameState?.players.find(p => p.id === playerId)?.color || '#ccc'
}

const showPlayerDetails = (player: Player) => {
  selectedPlayer.value = player
  showPlayerDetailsModal.value = true
}

const calculatePlayerNetWorth = (player: Player) => {
  let totalValue = player.money
  player.properties.forEach(propertyId => {
    const property = boardProperties.value.find(p => p.id === propertyId)
    if (property) {
      totalValue += property.price
      totalValue += property.houses * 1000 // 假设每个房屋价值1000元
    }
  })
  return totalValue
}

const getCurrentPositionName = (position: number) => {
  const property = boardProperties.value.find(p => p.position === position)
  return property?.name || '未知位置'
}

const getPropertyById = (propertyId: string) => {
  return boardProperties.value.find(p => p.id === propertyId)
}

const viewPropertyDetails = (propertyId: string) => {
  const property = getPropertyById(propertyId)
  if (property) {
    selectedProperty.value = property
    showPlayerDetailsModal.value = false
  }
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
    // 骰子动画持续时间
    setTimeout(() => {
      rolling.value = false
    }, 1000)
  } catch (error) {
    rolling.value = false
  }
}

// 全局事件处理函数，供gameStore调用
const handleServerEvent = (eventData: any) => {
  if (eventData.playerId !== gameStore.myPlayer?.id) return
  
  switch (eventData.type) {
    case 'property':
      showPropertyPurchaseDialog({
        id: eventData.propertyId,
        name: eventData.propertyName,
        price: eventData.price,
        description: '',
        position: 0,
        rent: 0,
        group: '',
        houses: 0,
        hotels: 0,
        mortgaged: false
      })
      break
      
    case 'chance':
      showEventNotification('🎲 机会', eventData.card.description, '🍀')
      break
      
    case 'community':
      showEventNotification('🏛️ 公共服务', eventData.card.description, '🤝')
      break
      
    case 'tax':
      showEventNotification('💸 税收', `需要缴纳${eventData.amount}元税费`, '💰')
      break
      
    case 'rent':
      showEventNotification('💰 支付租金', `需要向${eventData.ownerName}支付${eventData.amount}元租金`, '🏠')
      break
      
    case 'jail':
      showEventNotification('🔒 监狱', '您正在监狱中访问', '👮‍♂️')
      break
      
    case 'gotojail':
      showEventNotification('🚨 去监狱', '您被送进了监狱！', '🔒')
      break
      
    case 'parking':
      showEventNotification('🅿️ 免费停车', '在这里休息一下吧', '😌')
      break
      
    case 'ownProperty':
      if (eventData.canUpgrade) {
        showPropertyUpgradeDialog(eventData)
      } else {
        showEventNotification('🏠 您的地产', eventData.message, '😊')
      }
      break
      
    default:
      if (eventData.message) {
        showEventNotification('ℹ️ 事件', eventData.message, '📍')
      }
      break
  }
}

// 在组件挂载时注册全局事件处理函数
onMounted(() => {
  window.handlePlayerEvent = handleServerEvent
})

// 在组件卸载时清理
onUnmounted(() => {
  if (window.handlePlayerEvent) {
    delete window.handlePlayerEvent
  }
})

// 旧的本地事件处理逻辑已被服务器事件替代
// const handlePlayerLanded = ... (已移除，使用服务器事件)

// 显示地产购买对话框
const showPropertyPurchaseDialog = (property: Property) => {
  currentEventProperty.value = property
  eventDialog.value = {
    title: '🏠 地产购买机会',
    icon: '🏠',
    message: `您到达了 ${property.name}`,
    description: property.description || '',
    type: 'property',
    price: property.price,
    propertyId: property.id
  }
  showEventDialog.value = true
}

// 显示地产升级对话框
const showPropertyUpgradeDialog = (upgradeData: any) => {
  currentEventProperty.value = {
    id: upgradeData.propertyId,
    name: upgradeData.propertyName,
    description: upgradeData.message,
    price: upgradeData.upgradePrice,
    position: 0,
    rent: 0,
    group: '',
    houses: upgradeData.currentHouses,
    hotels: 0,
    mortgaged: false
  }
  
  // 从游戏状态获取完整的地产信息
  const property = boardProperties.value.find(p => p.id === upgradeData.propertyId)
  const baseRent = property?.rent || 0
  const currentRent = baseRent * (1 + upgradeData.currentHouses * 1.0)
  const futureRent = baseRent * (1 + (upgradeData.currentHouses + 1) * 1.0)
  const rentIncrease = futureRent - currentRent
  
  eventDialog.value = {
    title: '🏠 地产升级',
    icon: '🏠',
    message: `${upgradeData.propertyName} (${upgradeData.currentHouses}/${upgradeData.maxHouses}栋房屋)`,
    description: `建造房屋可以大幅提升租金收入。\n\n当前租金: ¥${currentRent.toLocaleString()}\n升级后租金: ¥${futureRent.toLocaleString()} (+¥${rentIncrease.toLocaleString()})\n房屋建造费用: ¥${upgradeData.upgradePrice.toLocaleString()}`,
    type: 'upgrade',
    price: upgradeData.upgradePrice,
    propertyId: upgradeData.propertyId
  }
  showEventDialog.value = true
}
const showEventNotification = (title: string, message: string, icon: string) => {
  eventDialog.value = {
    title,
    icon,
    message,
    description: '',
    type: 'event',
    price: 0,
    propertyId: ''
  }
  showEventDialog.value = true
}

// 处理地产升级
const handlePropertyUpgrade = async () => {
  if (!currentEventProperty.value) return
  
  purchasing.value = true
  try {
    await gameStore.buildHouse(currentEventProperty.value.id)
    showEventDialog.value = false
    currentEventProperty.value = null
    // 升级完成后发送确认事件
    gameStore.confirmEvent()
  } catch (error) {
    console.error('升级地产失败:', error)
  } finally {
    purchasing.value = false
  }
}

// 处理拒绝升级
const handleUpgradeDecline = () => {
  showEventDialog.value = false
  currentEventProperty.value = null
  // 发送确认事件到服务器以完成回合
  gameStore.confirmEvent()
}
const handlePropertyPurchase = async () => {
  if (!currentEventProperty.value) return
  
  purchasing.value = true
  try {
    await gameStore.buyProperty(currentEventProperty.value.id)
    showEventDialog.value = false
    currentEventProperty.value = null
    // 购买完成后发送确认事件
    gameStore.confirmEvent()
  } catch (error) {
    console.error('购买地产失败:', error)
  } finally {
    purchasing.value = false
  }
}

// 处理拒绝购买
const handlePropertyDecline = () => {
  showEventDialog.value = false
  currentEventProperty.value = null
  // 发送确认事件到服务器以完成回合
  gameStore.confirmEvent()
}

// 处理事件确认
const handleEventConfirm = () => {
  showEventDialog.value = false
  // 发送确认事件到服务器以完成回合
  gameStore.confirmEvent()
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

// 移除旧的位置监听逻辑，现在使用服务器事件驱动
</script>

<style scoped>
.game-board-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  gap: 20px;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.game-board {
  position: relative;
  width: 800px;
  height: 800px;
  background: linear-gradient(145deg, #f0f8ff 0%, #e6f3ff 100%);
  border: 6px solid #4a90e2;
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 2px 10px rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  overflow: hidden;
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
  overflow: hidden;
}

.property-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.property-cell.owned {
  border-color: #4CAF50;
  background: #e8f5e8;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.property-cell.owned-by-current {
  border-color: #FFC107;
  background: #fff9c4;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.owner-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 8px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.owner-name {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1px 3px;
  border-radius: 3px;
  white-space: nowrap;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  width: 380px;
  height: 380px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
  border-radius: 20px;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.15),
    inset 0 2px 8px rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 30px;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 20px;
  text-align: center;
}

.game-title-section {
  grid-row: 1;
}

.player-turn-section {
  grid-row: 2;
  min-height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-state-section {
  grid-row: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 180px;
  gap: 15px;
}

.dice-display {
  flex-shrink: 0;
  padding: 10px 0;
}

.dice-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.spacer {
  flex: 1;
  min-height: 20px;
}

.action-buttons {
  flex-shrink: 0;
  padding: 10px 0;
}

.game-logo h2 {
  font-size: 2.2rem;
  margin: 0;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-logo h3 {
  margin: 5px 0 0 0;
  color: #333;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 0.9rem;
}

.turn-info {
  font-size: 14px;
  color: #333;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: rgba(102, 126, 234, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dice-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 0;
  padding: 5px 0;
}

.dice {
  width: 45px;
  height: 45px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #333;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  box-shadow:
    0 6px 15px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.dice.rolling {
  animation: diceRoll 1s ease-in-out;
}

@keyframes diceRoll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  25% { transform: rotateX(90deg) rotateY(90deg) scale(1.1); }
  50% { transform: rotateX(180deg) rotateY(180deg) scale(1.2); }
  75% { transform: rotateX(270deg) rotateY(270deg) scale(1.1); }
  100% { transform: rotateX(360deg) rotateY(360deg) scale(1); }
}

.roll-dice-btn {
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  min-width: 120px;
}

.roll-dice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
  cursor: pointer;
  position: relative;
}

.player-status:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.player-status.current-player {
  background: #fff3cd;
  border: 2px solid #ffc107;
}

.player-status.my-player {
  background: #d4edda;
  border: 2px solid #28a745;
}

.view-details-hint {
  position: absolute;
  right: 15px;
  color: #6c757d;
  font-size: 16px;
}

.player-net-worth {
  font-size: 11px;
  color: #28a745;
  font-weight: bold;
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

/* 玩家详情模态框样式 */
.player-details-content {
  padding: 20px 0;
}

.player-basic-info {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
}

.player-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 28px;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.player-info-stats h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 24px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-grid .stat-item {
  display: flex;
  flex-direction: column;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-grid .stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-grid .stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.owned-properties h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.no-properties {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.property-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.property-card-header {
  padding: 10px;
  color: white;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
}

.property-card-body {
  padding: 12px;
}

.property-card .property-stat {
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.property-card .property-stat:last-child {
  margin-bottom: 0;
}

/* 事件对话框样式 */
.event-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.event-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.event-message {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
}

.event-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.event-dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.event-dialog-footer .el-button {
  min-width: 100px;
}
</style>