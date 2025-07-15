export interface Player {
  id: string
  name: string
  color: string
  position: number
  money: number
  properties: string[]
  inJail: boolean
  avatar: string
  isOnline: boolean
}

export interface Property {
  id: string
  name: string
  position: number
  price: number
  rent: number
  group: string
  owner?: string
  houses: number
  hotels: number
  mortgaged: boolean
  description: string
  culture?: string
  financialTip?: string
}

export interface GameState {
  id: string
  players: Player[]
  currentPlayer: number
  phase: 'waiting' | 'playing' | 'ended'
  board: Property[]
  dice: [number, number]
  lastRoll: number
  turn: number
  winner?: string
  chanceCards: Card[]
  communityCards: Card[]
}

export interface Card {
  id: string
  type: 'chance' | 'community'
  title: string
  description: string
  action: string
  amount?: number
  position?: number
}

export interface Room {
  id: string
  name: string
  host: string
  players: Player[]
  maxPlayers: number
  status: 'waiting' | 'playing' | 'ended'
  settings: RoomSettings
  createdAt: Date
}

export interface RoomSettings {
  startingMoney: number
  maxTurns: number
  enableTrading: boolean
  enableAuction: boolean
  timeLimit: number
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
  type: 'chat' | 'system' | 'trade'
}

export interface TradeOffer {
  id: string
  fromPlayerId: string
  toPlayerId: string
  fromMoney: number
  toMoney: number
  fromProperties: string[]
  toProperties: string[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface GameEvent {
  type: string
  data: any
  timestamp: Date
}