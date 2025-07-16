<template>
  <div class="stock-trading-panel">
    <el-card class="stock-panel">
      <template #header>
        <div class="stock-header">
          <h3>📈 股票交易</h3>
          <el-button 
            @click="refreshStockData" 
            :icon="RefreshIcon" 
            size="small"
            circle
            :loading="refreshing"
          />
        </div>
      </template>
      
      <div class="stock-content">
        <!-- 股票总资产 -->
        <div class="stock-summary">
          <div class="summary-item">
            <div class="summary-label">股票总价值</div>
            <div class="summary-value">¥{{ totalStockValue.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">现金余额</div>
            <div class="summary-value">¥{{ playerCash.toLocaleString() }}</div>
          </div>
        </div>

        <!-- 股票列表 -->
        <div class="stock-list">
          <div 
            v-for="stock in stockList" 
            :key="stock.id"
            class="stock-item"
            :class="{ 'trend-up': stock.trend === 'up', 'trend-down': stock.trend === 'down' }"
          >
            <div class="stock-info">
              <div class="stock-name">{{ stock.name }}</div>
              <div class="stock-details">
                <div class="stock-price">
                  <span class="price-label">当前价格:</span>
                  <span class="price-value">¥{{ stock.price.toLocaleString() }}</span>
                  <span class="trend-indicator" :class="stock.trend">
                    {{ getTrendIcon(stock.trend) }}
                  </span>
                </div>
                <div class="stock-holding">
                  <span class="holding-label">持有:</span>
                  <span class="holding-value">{{ getHoldingQuantity(stock.id) }}股</span>
                </div>
              </div>
            </div>
            
            <div class="stock-actions">
              <div class="quantity-controls">
                <el-input-number
                  v-model="stockQuantities[stock.id]"
                  :min="1"
                  :max="Math.max(1, Math.floor(playerCash / stock.price))"
                  size="small"
                  controls-position="right"
                  style="width: 100px"
                />
              </div>
              <div class="action-buttons">
                <el-button 
                  type="success" 
                  size="small"
                  @click="buyStock(stock.id)"
                  :disabled="!canBuyStock(stock.id)"
                  :loading="trading[stock.id]"
                >
                  买入
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="sellStock(stock.id)"
                  :disabled="!canSellStock(stock.id)"
                  :loading="trading[stock.id]"
                >
                  卖出
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 交易记录 -->
        <div class="trading-history" v-if="tradingHistory.length > 0">
          <h4>📋 最近交易</h4>
          <div class="history-list">
            <div 
              v-for="record in tradingHistory.slice(-5)" 
              :key="record.id"
              class="history-item"
              :class="record.type"
            >
              <div class="history-icon">
                {{ record.type === 'buy' ? '📈' : '📉' }}
              </div>
              <div class="history-details">
                <div class="history-text">
                  {{ record.type === 'buy' ? '买入' : '卖出' }} {{ record.quantity }}股 {{ record.stockName }}
                </div>
                <div class="history-amount">
                  ¥{{ record.amount.toLocaleString() }}
                </div>
                <div class="history-time">
                  {{ formatTime(record.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { Refresh as RefreshIcon } from '@element-plus/icons-vue'

const gameStore = useGameStore()

// 响应式数据
const stockQuantities = ref<Record<string, number>>({})
const trading = ref<Record<string, boolean>>({})
const refreshing = ref(false)
const tradingHistory = ref<any[]>([])

// 初始化股票数量
const initStockQuantities = () => {
  stockQuantities.value = {
    'HUAI_FOOD': 1,
    'HUAI_TECH': 1,
    'HUAI_TOURISM': 1,
    'HUAI_BANK': 1
  }
}

// 计算属性
const stockList = computed(() => {
  return gameStore.gameState?.stockData?.stocks || []
})

const playerCash = computed(() => {
  return gameStore.myPlayer?.money || 0
})

const totalStockValue = computed(() => {
  const stocks = gameStore.gameState?.stockData?.stocks || []
  const playerStocks = gameStore.gameState?.stockData?.playerStocks?.get(gameStore.myPlayer?.id || '') || {}
  
  let total = 0
  for (const [stockId, quantity] of Object.entries(playerStocks)) {
    const stock = stocks.find(s => s.id === stockId)
    if (stock) {
      total += stock.price * (quantity as number)
    }
  }
  return total
})

// 方法
const getHoldingQuantity = (stockId: string) => {
  const playerStocks = gameStore.gameState?.stockData?.playerStocks?.get(gameStore.myPlayer?.id || '') || {}
  return playerStocks[stockId] || 0
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return '↗️'
    case 'down': return '↘️'
    default: return '➡️'
  }
}

const canBuyStock = (stockId: string) => {
  const stock = stockList.value.find(s => s.id === stockId)
  if (!stock) return false
  
  const quantity = stockQuantities.value[stockId] || 1
  return playerCash.value >= stock.price * quantity
}

const canSellStock = (stockId: string) => {
  const quantity = stockQuantities.value[stockId] || 1
  return getHoldingQuantity(stockId) >= quantity
}

const buyStock = async (stockId: string) => {
  const quantity = stockQuantities.value[stockId] || 1
  if (!canBuyStock(stockId)) return
  
  trading.value[stockId] = true
  try {
    await gameStore.buyStock(stockId, quantity)
    
    // 添加到交易记录
    const stock = stockList.value.find(s => s.id === stockId)
    if (stock) {
      tradingHistory.value.push({
        id: Date.now(),
        type: 'buy',
        stockId,
        stockName: stock.name,
        quantity,
        amount: stock.price * quantity,
        timestamp: new Date()
      })
    }
  } catch (error) {
    console.error('买入股票失败:', error)
  } finally {
    trading.value[stockId] = false
  }
}

const sellStock = async (stockId: string) => {
  const quantity = stockQuantities.value[stockId] || 1
  if (!canSellStock(stockId)) return
  
  trading.value[stockId] = true
  try {
    await gameStore.sellStock(stockId, quantity)
    
    // 添加到交易记录
    const stock = stockList.value.find(s => s.id === stockId)
    if (stock) {
      tradingHistory.value.push({
        id: Date.now(),
        type: 'sell',
        stockId,
        stockName: stock.name,
        quantity,
        amount: stock.price * quantity,
        timestamp: new Date()
      })
    }
  } catch (error) {
    console.error('卖出股票失败:', error)
  } finally {
    trading.value[stockId] = false
  }
}

const refreshStockData = async () => {
  refreshing.value = true
  try {
    await gameStore.getStockData()
  } finally {
    refreshing.value = false
  }
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 监听游戏状态变化
watch(() => gameStore.gameState?.stockData, (newData) => {
  if (newData) {
    // 股票数据更新时的处理
    console.log('股票数据更新:', newData)
  }
}, { deep: true })

// 组件挂载
onMounted(() => {
  initStockQuantities()
  refreshStockData()
})

// 暴露给父组件的方法
defineExpose({
  refreshStockData,
  getTotalStockValue: () => totalStockValue.value
})
</script>

<style scoped>
.stock-trading-panel {
  height: 100%;
}

.stock-panel {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: white;
}

.stock-content {
  max-height: 500px;
  overflow-y: auto;
}

.stock-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.summary-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #28a745;
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.stock-item {
  background: white;
  border-radius: 10px;
  padding: 15px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
}

.stock-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stock-item.trend-up {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.stock-item.trend-down {
  border-color: #dc3545;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
}

.stock-info {
  margin-bottom: 15px;
}

.stock-name {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stock-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-label, .holding-label {
  font-size: 12px;
  color: #666;
}

.price-value, .holding-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.trend-indicator {
  font-size: 16px;
}

.trend-indicator.up {
  color: #28a745;
}

.trend-indicator.down {
  color: #dc3545;
}

.stock-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.quantity-controls {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .el-button {
  min-width: 60px;
  border-radius: 6px;
  font-weight: 600;
}

.trading-history {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.trading-history h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid transparent;
}

.history-item.buy {
  border-left-color: #28a745;
}

.history-item.sell {
  border-left-color: #dc3545;
}

.history-icon {
  font-size: 20px;
  margin-right: 10px;
}

.history-details {
  flex: 1;
}

.history-text {
  font-size: 13px;
  color: #333;
  margin-bottom: 2px;
}

.history-amount {
  font-size: 12px;
  font-weight: bold;
  color: #28a745;
}

.history-time {
  font-size: 11px;
  color: #666;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-input-number .el-input-number__increase),
:deep(.el-input-number .el-input-number__decrease) {
  border-radius: 0;
}

/* 自定义滚动条 */
.stock-content::-webkit-scrollbar {
  width: 6px;
}

.stock-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.stock-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.stock-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>