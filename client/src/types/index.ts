export interface Player {
  id: string
  name: string
  color: string
  position: number
  money: number
  properties: string[]
  inJail: boolean
  jailTurns: number
  isBankrupt: boolean
  avatar: string
  isOnline: boolean
  hasShip: boolean
  buffs: Buff[]
  monopolies: string[]
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
  auctionData: AuctionData
  stockData: StockData
  gameEvents: GameEvent[]
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
  id: string
  type: string
  data: any
  timestamp: Date
  turn: number
}

// 新增接口
export interface Buff {
  type: string
  remaining: number
  value: number
}

export interface AuctionData {
  isActive: boolean
  propertyId: string | null
  currentBid: number
  highestBidder: string | null
  participants: string[]
  timeRemaining: number
  startTime: number | null
}

export interface Stock {
  id: string
  name: string
  price: number
  trend: 'up' | 'down' | 'stable'
  volume: number
}

export interface StockData {
  stocks: Stock[]
  playerStocks: Map<string, Record<string, number>>
}