const express = require('express')
const gameController = require('../controllers/gameController')
const roomController = require('../controllers/roomController')
const playerController = require('../controllers/playerController')

const router = express.Router()

// 游戏相关路由
router.get('/games', gameController.getGames)
router.get('/games/:id', gameController.getGame)
router.post('/games', gameController.createGame)
router.put('/games/:id', gameController.updateGame)
router.delete('/games/:id', gameController.deleteGame)

// 房间相关路由
router.get('/rooms', roomController.getRooms)
router.get('/rooms/:id', roomController.getRoom)
router.post('/rooms', roomController.createRoom)
router.put('/rooms/:id', roomController.updateRoom)
router.delete('/rooms/:id', roomController.deleteRoom)

// 玩家相关路由
router.get('/players', playerController.getPlayers)
router.get('/players/:id', playerController.getPlayer)
router.post('/players', playerController.createPlayer)
router.put('/players/:id', playerController.updatePlayer)
router.delete('/players/:id', playerController.deletePlayer)

// 统计信息
router.get('/stats', (req, res) => {
  res.json({
    totalGames: 0,
    totalPlayers: 0,
    activeRooms: 0,
    onlineUsers: 0
  })
})

module.exports = router