<template>
  <div class="home-container">
    <!-- 动态背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <!-- 英雄区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="game-icon">🏛️</div>
        <h1 class="game-title">淮安大富翁</h1>
        <p class="game-subtitle">体验淮安文化 · 学习金融知识</p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">6</div>
            <div class="stat-label">最多玩家</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">20+</div>
            <div class="stat-label">淮安地标</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">∞</div>
            <div class="stat-label">无限乐趣</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="cards-container">
        <!-- 创建房间卡片 -->
        <div class="glass-card create-card">
          <div class="card-header">
            <div class="card-icon create-icon">🎮</div>
            <h3 class="card-title">开始游戏</h3>
            <p class="card-subtitle">创建新房间，邀请朋友一起玩</p>
          </div>

          <div class="card-content">
            <div class="input-group">
              <label class="input-label">玩家昵称</label>
              <input
                v-model="playerName"
                class="glass-input"
                placeholder="请输入您的昵称"
                maxlength="20"
              />
            </div>

            <div class="input-group">
              <label class="input-label">房间名称</label>
              <input
                v-model="roomName"
                class="glass-input"
                placeholder="请输入房间名称"
                maxlength="30"
              />
            </div>

            <button
              class="glass-button primary-button"
              @click="handleCreateRoom"
              :disabled="gameStore.isLoading"
            >
              <span v-if="gameStore.isLoading" class="loading-spinner"></span>
              <span v-else>创建房间</span>
            </button>
          </div>
        </div>

        <!-- 加入房间卡片 -->
        <div class="glass-card join-card">
          <div class="card-header">
            <div class="card-icon join-icon">🚪</div>
            <h3 class="card-title">加入房间</h3>
            <p class="card-subtitle">输入房间ID，加入现有游戏</p>
          </div>

          <div class="card-content">
            <div class="input-group">
              <label class="input-label">玩家昵称</label>
              <input
                v-model="joinPlayerName"
                class="glass-input"
                placeholder="请输入您的昵称"
                maxlength="20"
              />
            </div>

            <div class="input-group">
              <label class="input-label">房间ID</label>
              <input
                v-model="joinRoomId"
                class="glass-input"
                placeholder="请输入房间ID"
              />
            </div>

            <button
              class="glass-button success-button"
              @click="handleJoinRoom"
              :disabled="gameStore.isLoading"
            >
              <span v-if="gameStore.isLoading" class="loading-spinner"></span>
              <span v-else>加入房间</span>
            </button>
          </div>
        </div>
      </div>


      <!-- 游戏特色展示 -->
      <div class="features-section">
        <div class="section-header">
          <h2 class="section-title">🎯 游戏特色</h2>
          <p class="section-subtitle">探索淮安，体验不一样的大富翁</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <div class="feature-icon">🗺️</div>
            </div>
            <h4 class="feature-title">淮安特色地图</h4>
            <p class="feature-description">游戏地图基于淮安真实地理位置设计，包含淮安府署、河下古镇、清晏园等著名景点</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <div class="feature-icon">💰</div>
            </div>
            <h4 class="feature-title">金融知识学习</h4>
            <p class="feature-description">在游戏过程中学习投资理财、市场交易等金融常识，寓教于乐</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <div class="feature-icon">👥</div>
            </div>
            <h4 class="feature-title">多人联机对战</h4>
            <p class="feature-description">最多支持6人同时在线游戏，与朋友一起体验大富翁的乐趣</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接状态指示器 -->
    <div class="connection-status">
      <div class="status-indicator" :class="{ connected: gameStore.isConnected }">
        <div class="status-dot"></div>
        <span class="status-text">
          {{ gameStore.isConnected ? '已连接' : '未连接' }}
        </span>
      </div>
    </div>

    <!-- 错误提示模态框 -->
    <div v-if="showError" class="modal-overlay" @click="handleCloseError">
      <div class="error-modal" @click.stop>
        <div class="modal-header">
          <div class="error-icon">⚠️</div>
          <h3>提示</h3>
        </div>
        <div class="modal-body">
          <p>{{ gameStore.error }}</p>
        </div>
        <div class="modal-footer">
          <button class="glass-button primary-button" @click="handleCloseError">
            确定
          </button>
        </div>
      </div>
    </div>
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
/* 主容器 - 苹果风格深色渐变背景 */
.home-container {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow-x: hidden;
}

/* 动态背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 30%;
  animation-delay: 4s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  bottom: 20%;
  left: 20%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 英雄区域 */
.hero-section {
  position: relative;
  z-index: 1;
  padding: 80px 20px 60px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.game-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.game-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.game-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  font-weight: 300;
}

/* 英雄区域统计数据 */
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 5px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

/* 主内容区域 */
.main-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

/* 卡片容器 */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
}

/* 毛玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.create-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.join-icon {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

/* 毛玻璃输入框 */
.glass-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 1rem;
  color: white;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.glass-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

/* 毛玻璃按钮 */
.glass-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.glass-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.glass-button:hover::before {
  left: 100%;
}

.glass-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.glass-button:active {
  transform: translateY(0);
}

.glass-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.success-button {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  border: none;
}

/* 加载动画 */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 特色功能区域 */
.features-section {
  margin-top: 60px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

/* 特色功能网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 30px 25px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.feature-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 2rem;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 15px;
}

.feature-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

/* 连接状态指示器 */
.connection-status {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 1000;
}

.status-indicator {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.4);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f44336;
  animation: pulse 2s infinite;
}

.status-indicator.connected .status-dot {
  background: #4caf50;
}

.status-text {
  font-size: 0.85rem;
  color: white;
  font-weight: 500;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 错误模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.error-modal {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 1.5rem;
}

.modal-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.modal-body p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0 0 25px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-title {
    font-size: 2.5rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 20px;
  }

  .stat-divider {
    width: 40px;
    height: 1px;
  }

  .cards-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .connection-status {
    top: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 0;
  }

  .hero-section {
    padding: 60px 15px 40px;
  }

  .main-content {
    padding: 0 15px 60px;
  }

  .glass-card {
    padding: 25px 20px;
  }

  .game-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>