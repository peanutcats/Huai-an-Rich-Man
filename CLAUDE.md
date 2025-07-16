# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Installation
```bash
npm run install:all  # Install all dependencies (root, client, server)
```

### Development
```bash
npm run dev          # Start both client and server in development mode
npm run dev:client   # Start only Vue client (port 3000)
npm run dev:server   # Start only Node.js server (port 8080)
```

### Production
```bash
npm run build        # Build client for production
npm start           # Start production server
```

### Testing
```bash
cd server && npm test  # Run Jest tests for server
```

### Database
```bash
# Initialize database
mysql -u root -p -e "CREATE DATABASE huaian_monopoly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p huaian_monopoly < database/schema.sql

# Reset database
mysql -u root -p huaian_monopoly < database/schema.sql
```

## Architecture Overview

### Technology Stack
- **Frontend**: Vue 3 + TypeScript + Vite + Element Plus + Pinia
- **Backend**: Node.js + Express + Socket.io + MySQL
- **Real-time**: WebSocket with Socket.io for multiplayer gaming
- **Database**: MySQL for persistent storage

### Key Application Flow
1. Players create/join rooms through REST API
2. Game state managed in-memory with periodic database saves
3. Real-time updates via WebSocket events
4. Complex game logic handled in `Game` class

### Core Components

#### Frontend (client/)
- **GameStore** (`src/stores/gameStore.ts`): Pinia store managing WebSocket connection, game state, and player actions
- **Views**: GameBoard, GameRoom, Home for different game phases
- **Real-time Events**: Socket.io client handles game events like dice rolls, property purchases, auctions

#### Backend (server/)
- **Game Class** (`src/game/Game.js`): Core game logic including:
  - Turn management and dice rolling
  - Property buying/selling with auction system
  - Financial systems: mortgages, stocks, rent calculation
  - Special effects: buffs, monopoly bonuses, card actions
- **Socket Handler** (`src/game/socketHandler.js`): WebSocket event management
- **Models**: Player, Room classes for data persistence

### Game Features
- **Monopoly Gameplay**: 40 Huaian-themed properties with rent calculation
- **Financial Systems**: Auctions, mortgages, stock trading
- **Special Effects**: Buff system, monopoly bonuses, card effects
- **Multiplayer**: Up to 6 players via WebSocket
- **Persistence**: Game state saved to MySQL database

### Development Patterns
- **State Management**: Pinia for frontend, in-memory Maps for backend game state
- **Real-time Updates**: Extensive use of Socket.io emit/on pattern
- **Error Handling**: Try-catch blocks with user-friendly error messages
- **Data Flow**: Client sends actions → Server validates → Game logic executes → State broadcast to all players
- **Modular Design**: Separate concerns between game logic, networking, and persistence

### Key Files to Understand
- `client/src/stores/gameStore.ts` - Frontend state management and Socket.io integration
- `server/src/game/Game.js` - Core game logic and mechanics
- `server/src/game/socketHandler.js` - Real-time event handling
- `server/src/utils/gameData.js` - Game constants and configuration
- `database/schema.sql` - Database structure

### Configuration
- Server connection: `http://localhost:8080` (hardcoded in gameStore.ts)
- Database config: `server/src/config/database.js`
- Environment variables: `server/.env` (copy from `.env.example`)

## Common Development Tasks

### Adding New Game Features
1. Update game logic in `Game.js`
2. Add Socket.io event handlers in `socketHandler.js`
3. Update frontend store actions in `gameStore.ts`
4. Add UI components as needed

### Debugging Real-time Issues
- Check WebSocket connection in browser dev tools
- Monitor Socket.io events in server logs
- Verify game state synchronization between client and server

### Database Changes
- Update `database/schema.sql`
- Reset database for local development
- Update model classes if needed