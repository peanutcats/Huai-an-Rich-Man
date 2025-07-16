<template>
  <div class="auction-panel">
    <!-- 拍卖状态显示 -->
    <el-card v-if="isAuctionActive" class="auction-card active">
      <template #header>
        <div class="auction-header">
          <h3>🔨 拍卖进行中</h3>
          <div class="auction-timer">
            <el-countdown 
              :value="auctionEndTime" 
              @finish="onAuctionEnd"
              format="mm:ss"
            />
          </div>
        </div>
      </template>
      
      <div class="auction-content">
        <!-- 拍卖物品信息 -->
        <div class="auction-item-info">
          <div class="item-name">{{ auctionProperty?.name }}</div>
          <div class="item-description">{{ auctionProperty?.description }}</div>
          <div class="item-stats">
            <div class="stat-item">
              <span class="stat-label">标价:</span>
              <span class="stat-value">¥{{ auctionProperty?.price.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">基础租金:</span>
              <span class="stat-value">¥{{ auctionProperty?.rent.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- 当前出价信息 -->
        <div class="current-bid-info">
          <div class="bid-amount">
            <span class="bid-label">当前最高出价:</span>
            <span class="bid-value">¥{{ currentBid.toLocaleString() }}</span>
          </div>
          <div class="bid-leader" v-if="highestBidder">
            <span class="leader-label">领先者:</span>
            <span class="leader-name">{{ getPlayerName(highestBidder) }}</span>
          </div>
          <div class="participants-count">
            <span class="count-label">参与人数:</span>
            <span class="count-value">{{ participantCount }}人</span>
          </div>
        </div>

        <!-- 出价控制 -->
        <div class="bid-controls" v-if="canParticipate">
          <div class="bid-input-section">
            <label class="bid-input-label">您的出价:</label>
            <el-input-number
              v-model="bidAmount"
              :min="currentBid + 1"
              :max="playerCash"
              :step="100"
              size="large"
              controls-position="right"
              style="width: 100%"
            />
            <div class="bid-suggestion">
              <span>建议出价: </span>
              <el-button 
                v-for="suggestion in bidSuggestions" 
                :key="suggestion"
                size="small" 
                text
                @click="bidAmount = suggestion"
                :disabled="suggestion > playerCash"
              >
                ¥{{ suggestion.toLocaleString() }}
              </el-button>
            </div>
          </div>
          
          <el-button 
            type="primary" 
            size="large"
            @click="placeBid"
            :disabled="!canBid"
            :loading="bidding"
            class="bid-button"
          >
            <template #icon>
              <el-icon><TrendCharts /></el-icon>
            </template>
            出价 ¥{{ bidAmount.toLocaleString() }}
          </el-button>
        </div>

        <!-- 非参与者显示 -->
        <div v-else class="non-participant">
          <el-alert
            title="观看模式"
            description="您无法参与此次拍卖，但可以观看拍卖过程"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 参与者列表 -->
        <div class="participants-list" v-if="participants.length > 0">
          <h4>🎯 参与者</h4>
          <div class="participant-items">
            <div 
              v-for="participant in participants" 
              :key="participant"
              class="participant-item"
              :class="{ 'is-leader': participant === highestBidder }"
            >
              <div class="participant-avatar" :style="{ backgroundColor: getPlayerColor(participant) }">
                {{ getPlayerName(participant).charAt(0) }}
              </div>
              <div class="participant-name">{{ getPlayerName(participant) }}</div>
              <div class="participant-status">
                {{ participant === highestBidder ? '🏆 领先' : '💰 参与中' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 拍卖历史/结果 -->
    <el-card v-if="!isAuctionActive && auctionHistory.length > 0" class="auction-history">
      <template #header>
        <h3>📋 拍卖记录</h3>
      </template>
      
      <div class="history-list">
        <div 
          v-for="record in auctionHistory.slice(-5)" 
          :key="record.id"
          class="history-item"
          :class="{ 'is-winner': record.isWinner }"
        >
          <div class="history-icon">
            {{ record.isWinner ? '🏆' : '🔨' }}
          </div>
          <div class="history-details">
            <div class="history-property">{{ record.propertyName }}</div>
            <div class="history-result">
              {{ record.isWinner ? '拍卖成功' : '拍卖流拍' }}
            </div>
            <div class="history-amount" v-if="record.finalBid > 0">
              成交价: ¥{{ record.finalBid.toLocaleString() }}
            </div>
            <div class="history-winner" v-if="record.winner">
              获得者: {{ record.winner }}
            </div>
            <div class="history-time">
              {{ formatTime(record.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 拍卖提示/指南 -->
    <el-card v-if="!isAuctionActive" class="auction-guide">
      <template #header>
        <h3>💡 拍卖指南</h3>
      </template>
      
      <div class="guide-content">
        <div class="guide-item">
          <div class="guide-icon">🏠</div>
          <div class="guide-text">
            <div class="guide-title">拍卖触发</div>
            <div class="guide-desc">当玩家拒绝购买地产时，该地产将进入60秒拍卖</div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">💰</div>
          <div class="guide-text">
            <div class="guide-title">出价规则</div>
            <div class="guide-desc">每次出价必须高于当前最高价，出价后无法撤回</div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">⏰</div>
          <div class="guide-text">
            <div class="guide-title">拍卖结束</div>
            <div class="guide-desc">倒计时结束后，最高出价者获得地产</div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">🎯</div>
          <div class="guide-text">
            <div class="guide-title">策略建议</div>
            <div class="guide-desc">考虑地产的地理位置、租金收益和垄断价值</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { TrendCharts } from '@element-plus/icons-vue'
import { getPropertyById } from '@/utils/gameData'

const gameStore = useGameStore()

// 响应式数据
const bidAmount = ref(0)
const bidding = ref(false)
const auctionHistory = ref<any[]>([])

// 计算属性
const isAuctionActive = computed(() => {
  return gameStore.gameState?.auctionData?.isActive || false
})

const auctionData = computed(() => {
  return gameStore.gameState?.auctionData || {}
})

const auctionProperty = computed(() => {
  if (!auctionData.value.propertyId) return null
  return getPropertyById(auctionData.value.propertyId)
})

const currentBid = computed(() => {
  return auctionData.value.currentBid || 0
})

const highestBidder = computed(() => {
  return auctionData.value.highestBidder
})

const participants = computed(() => {
  return auctionData.value.participants || []
})

const participantCount = computed(() => {
  return participants.value.length
})

const timeRemaining = computed(() => {
  return auctionData.value.timeRemaining || 0
})

const auctionEndTime = computed(() => {
  return Date.now() + (timeRemaining.value * 1000)
})

const playerCash = computed(() => {
  return gameStore.myPlayer?.money || 0
})

const canParticipate = computed(() => {
  return gameStore.myPlayer && !gameStore.myPlayer.isBankrupt && playerCash.value > 0
})

const canBid = computed(() => {
  return canParticipate.value && 
         bidAmount.value > currentBid.value && 
         bidAmount.value <= playerCash.value &&
         !bidding.value
})

const bidSuggestions = computed(() => {
  const base = currentBid.value
  const suggestions = [
    base + 100,
    base + 500,
    base + 1000,
    base + 2000
  ].filter(amount => amount <= playerCash.value)
  
  return suggestions
})

// 方法
const getPlayerName = (playerId: string) => {
  return gameStore.gameState?.players.find(p => p.id === playerId)?.name || '未知玩家'
}

const getPlayerColor = (playerId: string) => {
  return gameStore.gameState?.players.find(p => p.id === playerId)?.color || '#ccc'
}

const placeBid = async () => {
  if (!canBid.value) return
  
  bidding.value = true
  try {
    await gameStore.placeBid(bidAmount.value)
  } catch (error) {
    console.error('出价失败:', error)
  } finally {
    bidding.value = false
  }
}

const onAuctionEnd = () => {
  console.log('拍卖倒计时结束')
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听拍卖状态变化
watch(() => auctionData.value, (newData, oldData) => {
  if (newData?.isActive && !oldData?.isActive) {
    // 拍卖开始
    bidAmount.value = Math.max(newData.currentBid + 100, 100)
  } else if (!newData?.isActive && oldData?.isActive) {
    // 拍卖结束，记录到历史
    if (oldData.propertyId) {
      const property = getPropertyById(oldData.propertyId)
      auctionHistory.value.push({
        id: Date.now(),
        propertyId: oldData.propertyId,
        propertyName: property?.name || '未知地产',
        finalBid: oldData.currentBid || 0,
        winner: oldData.highestBidder ? getPlayerName(oldData.highestBidder) : null,
        isWinner: !!oldData.highestBidder,
        timestamp: new Date()
      })
    }
  }
}, { deep: true })

// 监听游戏事件
const handleAuctionEvents = () => {
  // 监听拍卖开始事件
  gameStore.socket?.on('auctionStarted', (data: any) => {
    console.log('拍卖开始:', data)
    bidAmount.value = Math.max(data.currentBid + 100, 100)
  })
  
  // 监听出价事件
  gameStore.socket?.on('bidPlaced', (data: any) => {
    console.log('新的出价:', data)
    // 如果不是自己的出价，建议新的出价金额
    if (data.playerId !== gameStore.myPlayer?.id) {
      bidAmount.value = Math.max(data.currentBid + 100, bidAmount.value)
    }
  })
  
  // 监听拍卖结束事件
  gameStore.socket?.on('auctionEnded', (data: any) => {
    console.log('拍卖结束:', data)
  })
}

// 组件挂载和卸载
onMounted(() => {
  handleAuctionEvents()
  // 初始化出价金额
  if (isAuctionActive.value) {
    bidAmount.value = Math.max(currentBid.value + 100, 100)
  }
})

onUnmounted(() => {
  // 清理事件监听器
  gameStore.socket?.off('auctionStarted')
  gameStore.socket?.off('bidPlaced')
  gameStore.socket?.off('auctionEnded')
})

// 暴露给父组件的方法
defineExpose({
  isActive: isAuctionActive,
  currentBid: currentBid,
  placeBid
})
</script>

<style scoped>
.auction-panel {
  height: 100%;
}

.auction-card, .auction-history, .auction-guide {
  margin-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auction-card.active {
  border: 2px solid #f39c12;
  box-shadow: 0 8px 32px rgba(243, 156, 18, 0.3);
  animation: auctionPulse 2s infinite;
}

@keyframes auctionPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(243, 156, 18, 0.3);
  }
  50% { 
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(243, 156, 18, 0.4);
  }
}

.auction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auction-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: white;
}

.auction-timer {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  min-width: 80px;
  text-align: center;
}

.auction-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auction-item-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.item-name {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.item-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 15px;
}

.item-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 13px;
  font-weight: bold;
  color: #333;
}

.current-bid-info {
  background: linear-gradient(135deg, #fff3cd 0%, #fce4a8 100%);
  border-radius: 10px;
  padding: 20px;
  border: 2px solid #f39c12;
  text-align: center;
}

.bid-amount {
  margin-bottom: 10px;
}

.bid-label {
  font-size: 14px;
  color: #856404;
  display: block;
  margin-bottom: 5px;
}

.bid-value {
  font-size: 28px;
  font-weight: bold;
  color: #f39c12;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bid-leader, .participants-count {
  margin-bottom: 5px;
}

.leader-label, .count-label {
  font-size: 12px;
  color: #856404;
}

.leader-name, .count-value {
  font-size: 13px;
  font-weight: bold;
  color: #2c3e50;
  margin-left: 5px;
}

.bid-controls {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.bid-input-section {
  margin-bottom: 15px;
}

.bid-input-label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.bid-suggestion {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.bid-suggestion span {
  margin-right: 10px;
}

.bid-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 10px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  transition: all 0.3s ease;
}

.bid-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
}

.non-participant {
  text-align: center;
}

.participants-list {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
}

.participants-list h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #333;
}

.participant-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.participant-item.is-leader {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff3cd 0%, #fce4a8 100%);
  transform: scale(1.02);
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  margin-right: 10px;
}

.participant-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.participant-status {
  font-size: 12px;
  color: #666;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #dee2e6;
  transition: all 0.3s ease;
}

.history-item.is-winner {
  border-left-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.history-icon {
  font-size: 24px;
  margin-right: 15px;
}

.history-details {
  flex: 1;
}

.history-property {
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.history-result {
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.history-amount, .history-winner {
  font-size: 12px;
  color: #28a745;
  font-weight: 600;
  margin-bottom: 3px;
}

.history-time {
  font-size: 11px;
  color: #999;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.guide-icon {
  font-size: 24px;
  margin-right: 15px;
  margin-top: 2px;
}

.guide-text {
  flex: 1;
}

.guide-title {
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.guide-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  border-bottom: none;
}

:deep(.auction-guide .el-card__header) {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

:deep(.auction-history .el-card__header) {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

:deep(.el-countdown) {
  color: white;
  font-weight: bold;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
  height: 45px;
}

:deep(.el-alert) {
  border-radius: 8px;
}
</style>