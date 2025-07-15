<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="game-title">🏛️ 淮安大富翁</h1>
      <p class="game-subtitle">体验淮安文化，学习金融知识</p>
    </div>

    <div class="main-content">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="action-card">
            <template #header>
              <h3>🎮 开始游戏</h3>
            </template>
            
            <el-form @submit.prevent="handleCreateRoom">
              <el-form-item label="玩家昵称">
                <el-input 
                  v-model="playerName" 
                  placeholder="请输入您的昵称"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="房间名称">
                <el-input 
                  v-model="roomName" 
                  placeholder="请输入房间名称"
                  maxlength="30"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="handleCreateRoom"
                  :loading="gameStore.isLoading"
                  size="large"
                  style="width: 100%"
                >
                  创建房间
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="action-card">
            <template #header>
              <h3>🚪 加入房间</h3>
            </template>
            
            <el-form @submit.prevent="handleJoinRoom">
              <el-form-item label="玩家昵称">
                <el-input 
                  v-model="joinPlayerName" 
                  placeholder="请输入您的昵称"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="房间ID">
                <el-input 
                  v-model="joinRoomId" 
                  placeholder="请输入房间ID"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  type="success" 
                  @click="handleJoinRoom"
                  :loading="gameStore.isLoading"
                  size="large"
                  style="width: 100%"
                >
                  加入房间
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="info-card" style="margin-top: 20px;">
        <template #header>
          <h3>🎯 游戏特色</h3>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="feature-item">
              <div class="feature-icon">🗺️</div>
              <h4>淮安特色地图</h4>
              <p>游戏地图基于淮安真实地理位置设计，包含淮安府署、河下古镇、清晏园等著名景点</p>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="feature-item">
              <div class="feature-icon">💰</div>
              <h4>金融知识学习</h4>
              <p>在游戏过程中学习投资理财、市场交易等金融常识，寓教于乐</p>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="feature-item">
              <div class="feature-icon">👥</div>
              <h4>多人联机对战</h4>
              <p>最多支持6人同时在线游戏，与朋友一起体验大富翁的乐趣</p>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 连接状态指示器 -->
    <div class="connection-status">
      <el-tag 
        :type="gameStore.isConnected ? 'success' : 'danger'"
        size="small"
      >
        {{ gameStore.isConnected ? '🟢 已连接' : '🔴 未连接' }}
      </el-tag>
    </div>

    <!-- 错误提示 -->
    <el-dialog
      v-model="showError"
      title="提示"
      width="300px"
      center
    >
      <p>{{ gameStore.error }}</p>
      <template #footer>
        <el-button type="primary" @click="handleCloseError">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const gameStore = useGameStore()

const playerName = ref('')
const roomName = ref('淮安大富翁房间')
const joinPlayerName = ref('')
const joinRoomId = ref('')
const showError = ref(false)

// 监听错误
watch(() => gameStore.error, (error) => {
  if (error) {
    showError.value = true
  }
})

const handleCreateRoom = async () => {
  if (!playerName.value.trim()) {
    ElMessage.warning('请输入玩家昵称')
    return
  }
  
  if (!roomName.value.trim()) {
    ElMessage.warning('请输入房间名称')
    return
  }

  gameStore.createRoom(roomName.value.trim(), playerName.value.trim())
}

const handleJoinRoom = async () => {
  if (!joinPlayerName.value.trim()) {
    ElMessage.warning('请输入玩家昵称')
    return
  }
  
  if (!joinRoomId.value.trim()) {
    ElMessage.warning('请输入房间ID')
    return
  }

  gameStore.joinRoom(joinRoomId.value.trim(), joinPlayerName.value.trim())
}

const handleCloseError = () => {
  showError.value = false
  gameStore.clearError()
}

// 监听房间创建/加入成功
watch(() => gameStore.currentRoom, (room) => {
  if (room) {
    router.push(`/room/${room.id}`)
  }
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.game-title {
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.action-card {
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.info-card {
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.feature-item h4 {
  margin: 10px 0;
  color: #333;
}

.feature-item p {
  color: #666;
  line-height: 1.6;
}

.connection-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
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

:deep(.el-button--primary) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--success) {
  background: linear-gradient(45deg, #4ecdc4 0%, #44a08d 100%);
  border: none;
}
</style>