<template>
  <div class="game-room-container">
    <div class="room-header">
      <h2>🏠 {{ currentRoom?.name }}</h2>
      <div class="room-info">
        <el-tag type="info">房间ID: {{ currentRoom?.id }}</el-tag>
        <el-tag type="success">{{ currentRoom?.players?.length || 0 }}/{{ currentRoom?.maxPlayers || 6 }}人</el-tag>
        <el-tag :type="currentRoom?.status === 'waiting' ? 'warning' : 'success'">
          {{ getRoomStatusText(currentRoom?.status) }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 玩家列表 -->
      <el-col :span="16">
        <el-card class="players-card">
          <template #header>
            <h3>👥 玩家列表</h3>
          </template>
          
          <div class="players-grid">
            <div 
              v-for="(player, index) in currentRoom?.players" 
              :key="player.id"
              class="player-card"
              :class="{ 'is-host': currentRoom?.hostId === player.id, 'is-me': player.id === gameStore.currentPlayer?.id }"
            >
              <div class="player-avatar" :style="{ backgroundColor: player.color }">
                {{ player.name.charAt(0) }}
              </div>
              <div class="player-info">
                <div class="player-name">
                  {{ player.name }}
                  <el-tag v-if="currentRoom?.hostId === player.id" type="warning" size="small">房主</el-tag>
                  <el-tag v-if="player.id === gameStore.currentPlayer?.id" type="success" size="small">我</el-tag>
                </div>
                <div class="player-status">
                  <el-tag :type="player.isOnline ? 'success' : 'info'" size="small">
                    {{ player.isOnline ? '在线' : '离线' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 空位 -->
            <div 
              v-for="i in (currentRoom?.maxPlayers || 6) - (currentRoom?.players?.length || 0)" 
              :key="'empty-' + i"
              class="player-card empty-slot"
            >
              <div class="empty-avatar">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="player-info">
                <div class="player-name">等待玩家加入...</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 游戏控制和聊天 -->
      <el-col :span="8">
        <!-- 游戏控制 -->
        <el-card class="control-card" style="margin-bottom: 20px;">
          <template #header>
            <h3>🎮 游戏控制</h3>
          </template>
          
          <div class="game-controls">
            <el-button 
              v-if="isHost && canStartGame"
              type="primary" 
              size="large"
              @click="handleStartGame"
              :loading="gameStore.isLoading"
              style="width: 100%; margin-bottom: 10px;"
            >
              开始游戏
            </el-button>
            
            <el-button 
              v-if="isHost"
              type="warning" 
              size="large"
              @click="showSettings = true"
              style="width: 100%; margin-bottom: 10px;"
            >
              游戏设置
            </el-button>
            
            <el-button 
              type="info" 
              size="large"
              @click="copyRoomId"
              style="width: 100%; margin-bottom: 10px;"
            >
              复制房间ID
            </el-button>
            
            <el-button 
              type="danger" 
              size="large"
              @click="handleLeaveRoom"
              style="width: 100%;"
            >
              离开房间
            </el-button>
          </div>
        </el-card>

        <!-- 聊天区域 -->
        <el-card class="chat-card">
          <template #header>
            <h3>💬 聊天室</h3>
          </template>
          
          <div class="chat-messages" ref="chatContainer">
            <div 
              v-for="message in gameStore.chatMessages" 
              :key="message.id"
              class="chat-message"
              :class="{ 'my-message': message.playerId === gameStore.currentPlayer?.id }"
            >
              <div class="message-header">
                <span class="message-author">{{ message.playerName }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-content">{{ message.message }}</div>
            </div>
          </div>
          
          <div class="chat-input">
            <el-input
              v-model="chatMessage"
              placeholder="输入聊天消息..."
              @keyup.enter="sendChatMessage"
              maxlength="200"
            >
              <template #append>
                <el-button @click="sendChatMessage" :disabled="!chatMessage.trim()">
                  发送
                </el-button>
              </template>
            </el-input>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 游戏设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="游戏设置"
      width="500px"
    >
      <el-form :model="gameSettings" label-width="120px">
        <el-form-item label="起始资金">
          <el-input-number
            v-model="gameSettings.startingMoney"
            :min="1000"
            :max="10000"
            :step="500"
          />
        </el-form-item>
        
        <el-form-item label="最大回合数">
          <el-input-number
            v-model="gameSettings.maxTurns"
            :min="50"
            :max="200"
            :step="10"
          />
        </el-form-item>
        
        <el-form-item label="允许交易">
          <el-switch v-model="gameSettings.enableTrading" />
        </el-form-item>
        
        <el-form-item label="允许拍卖">
          <el-switch v-model="gameSettings.enableAuction" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const gameStore = useGameStore()

const chatMessage = ref('')
const chatContainer = ref<HTMLElement>()
const showSettings = ref(false)
const gameSettings = ref({
  startingMoney: 1500,
  maxTurns: 100,
  enableTrading: true,
  enableAuction: true
})

const currentRoom = computed(() => gameStore.currentRoom)
const isHost = computed(() => {
  return currentRoom.value?.hostId === gameStore.currentPlayer?.id
})

const canStartGame = computed(() => {
  return currentRoom.value?.players && 
         currentRoom.value.players.length >= 2 && 
         currentRoom.value.status === 'waiting'
})

const getRoomStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    waiting: '等待中',
    playing: '游戏中',
    ended: '已结束'
  }
  return statusMap[status] || '未知'
}

const handleStartGame = () => {
  gameStore.startGame()
}

const handleLeaveRoom = () => {
  gameStore.leaveRoom()
  router.push('/')
}

const copyRoomId = async () => {
  if (currentRoom.value?.id) {
    try {
      await navigator.clipboard.writeText(currentRoom.value.id)
      ElMessage.success('房间ID已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败，请手动复制')
    }
  }
}

const sendChatMessage = () => {
  if (chatMessage.value.trim()) {
    gameStore.sendChatMessage(chatMessage.value.trim())
    chatMessage.value = ''
  }
}

const saveSettings = () => {
  // 这里可以发送设置到服务器
  ElMessage.success('设置已保存')
  showSettings.value = false
}

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 自动滚动聊天到底部
watch(() => gameStore.chatMessages.length, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
})

// 监听游戏开始
watch(() => gameStore.gameState, (state) => {
  if (state && state.phase === 'playing') {
    router.push(`/game/${currentRoom.value?.id}`)
  }
})
</script>

<style scoped>
.game-room-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.room-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.room-header h2 {
  margin: 0;
  color: #333;
}

.room-info {
  display: flex;
  gap: 10px;
}

.players-card, .control-card, .chat-card {
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.player-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.player-card.is-host {
  border-color: #ffc107;
  background: #fff9c4;
}

.player-card.is-me {
  border-color: #28a745;
  background: #d4edda;
}

.empty-slot {
  border-style: dashed;
  color: #6c757d;
  opacity: 0.7;
}

.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.empty-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 10px;
}

.chat-message {
  margin-bottom: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-message.my-message {
  background: #e3f2fd;
  margin-left: 20px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
}

.message-author {
  font-weight: bold;
  color: #333;
}

.message-time {
  color: #666;
}

.message-content {
  color: #333;
  line-height: 1.4;
}

:deep(.el-card__header) {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-bottom: none;
}

:deep(.el-card__header h3) {
  margin: 0;
  font-size: 1.1rem;
}
</style>