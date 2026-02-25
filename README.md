# Ludo Royale Web

A premium, real-time multiplayer Ludo game built with Next.js, TypeScript, and Socket.io.

## Features
- **Real-time Multiplayer**: Play with friends or strangers using WebSockets.
- **AI Bot System**: Add intelligent bots to your game.
- **Private Rooms**: Create rooms with codes to play with friends.
- **Modern UI**: iOS-style clean interface with smooth animations.
- **Turn Timer**: 15-second turn limit with auto-skip.
- **Sound Effects**: Immersive dice, move, and win sounds.

## Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Motion.
- **Backend**: Node.js (Custom Server), Socket.io.
- **State Management**: Server-side authoritative state.

## Setup Instructions

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

### Deployment
This app is designed to run in a Node.js environment.
1. Build the project:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Database
The current version uses an in-memory store for game rooms. For a production environment with persistent user accounts and wallet systems, use the provided `database.sql` file with a MySQL/MariaDB server and update the server-side logic to interface with the database.

## Folder Structure
- `/app`: Next.js pages and layouts.
- `/components`: Reusable UI components (Board, Dice, etc.).
- `/hooks`: Custom React hooks (Socket connection, game logic).
- `/lib`: Configuration and utilities.
- `server.ts`: Custom Express + Socket.io server.
