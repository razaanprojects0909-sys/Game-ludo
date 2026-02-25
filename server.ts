import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import express from "express";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const httpServer = createServer(expressApp);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Game state storage (In-memory for this demo)
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", ({ roomId, username, color }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          players: [],
          gameState: "waiting",
          turn: 0,
          diceValue: null,
          tokens: {
            red: [0, 0, 0, 0],
            green: [0, 0, 0, 0],
            yellow: [0, 0, 0, 0],
            blue: [0, 0, 0, 0],
          },
        });
      }

      const room = rooms.get(roomId);
      const playerExists = room.players.find((p: any) => p.id === socket.id);
      
      if (!playerExists && room.players.length < 4) {
        room.players.push({
          id: socket.id,
          username,
          color: color || ["red", "green", "yellow", "blue"][room.players.length],
          isReady: false,
        });
      }

      io.to(roomId).emit("room-update", room);
    });

    socket.on("roll-dice", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const diceValue = Math.floor(Math.random() * 6) + 1;
      room.diceValue = diceValue;
      
      // Check if any move is possible
      const currentPlayer = room.players[room.turn];
      const color = currentPlayer.color as "red" | "green" | "yellow" | "blue";
      const canMove = room.tokens[color].some((pos: number) => {
        if (pos === 0) return diceValue === 6;
        return pos + diceValue <= 57;
      });

      if (!canMove) {
        // Auto skip after a short delay
        setTimeout(() => {
          room.turn = (room.turn + 1) % room.players.length;
          room.diceValue = null;
          io.to(roomId).emit("room-update", room);
          startTurnTimer(roomId);
          checkAITurn(roomId);
        }, 1500);
      }

      io.to(roomId).emit("dice-rolled", { diceValue, playerIndex: room.turn });
      io.to(roomId).emit("room-update", room);
    });

    socket.on("add-ai", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room && room.players.length < 4) {
        const colors = ["red", "green", "yellow", "blue"];
        const usedColors = room.players.map((p: any) => p.color);
        const availableColor = colors.find(c => !usedColors.includes(c));

        room.players.push({
          id: "ai-" + Math.random().toString(36).substr(2, 9),
          username: "AI Bot " + (room.players.length + 1),
          color: availableColor,
          isAI: true,
        });
        io.to(roomId).emit("room-update", room);
      }
    });

    // Check for AI turn
    function checkAITurn(roomId: string) {
      const room = rooms.get(roomId);
      if (!room || room.gameState !== "playing") return;

      const currentPlayer = room.players[room.turn];
      if (currentPlayer?.isAI) {
        setTimeout(() => {
          // Roll dice
          const diceValue = Math.floor(Math.random() * 6) + 1;
          room.diceValue = diceValue;
          io.to(roomId).emit("dice-rolled", { diceValue, playerIndex: room.turn });
          io.to(roomId).emit("room-update", room);

          setTimeout(() => {
            // Move token
            const color = currentPlayer.color as "red" | "green" | "yellow" | "blue";
            const tokens = room.tokens[color];
            
            // AI Logic: Find best move
            let bestTokenIdx = -1;
            
            // 1. Can unlock?
            if (diceValue === 6) {
              bestTokenIdx = tokens.findIndex((pos: number) => pos === 0);
            }
            
            // 2. Can cut? (Simplified)
            if (bestTokenIdx === -1) {
              // ... logic to find if any token can cut ...
            }

            // 3. Just move first available
            if (bestTokenIdx === -1) {
              bestTokenIdx = tokens.findIndex((pos: number) => pos > 0 && pos + diceValue <= 57);
            }

            if (bestTokenIdx !== -1) {
              // Execute move
              executeMove(roomId, bestTokenIdx);
            } else {
              // Skip
              room.turn = (room.turn + 1) % room.players.length;
              room.diceValue = null;
              io.to(roomId).emit("room-update", room);
              checkAITurn(roomId);
            }
          }, 1000);
        }, 1000);
      }
    }

    function executeMove(roomId: string, tokenIndex: number) {
      const room = rooms.get(roomId);
      if (!room) return;

      const currentPlayer = room.players[room.turn];
      const color = currentPlayer.color as "red" | "green" | "yellow" | "blue";
      const diceValue = room.diceValue;
      let currentPos = room.tokens[color][tokenIndex];
      let nextPos = currentPos === 0 ? 1 : currentPos + diceValue;

      room.tokens[color][tokenIndex] = nextPos;

      // Check for cutting
      if (nextPos > 0 && nextPos <= 51) {
        const globalPos = getGlobalPosition(color, nextPos);
        if (!isSafeSpot(globalPos)) {
          Object.keys(room.tokens).forEach((otherColor) => {
            if (otherColor === color) return;
            room.tokens[otherColor].forEach((otherPos: number, otherIdx: number) => {
              if (otherPos > 0 && otherPos <= 51) {
                if (globalPos === getGlobalPosition(otherColor as any, otherPos)) {
                  room.tokens[otherColor][otherIdx] = 0;
                  room.hasExtraTurn = true;
                }
              }
            });
          });
        }
      }

      if (room.tokens[color].every((p: number) => p === 57)) {
        room.gameState = "finished";
        room.winner = color;
      }

      if (diceValue === 6) room.hasExtraTurn = true;

      if (!room.hasExtraTurn) {
        room.turn = (room.turn + 1) % room.players.length;
      }
      
      room.hasExtraTurn = false;
      room.diceValue = null;
      io.to(roomId).emit("room-update", room);
      
      startTurnTimer(roomId);
      // Check if next player is AI
      checkAITurn(roomId);
    }

    socket.on("move-token", ({ roomId, tokenIndex }) => {
      executeMove(roomId, tokenIndex);
    });

    const TURN_TIMEOUT = 15000; // 15 seconds
    let turnTimer: NodeJS.Timeout | null = null;

    function startTurnTimer(roomId: string) {
      if (turnTimer) clearTimeout(turnTimer);
      
      const room = rooms.get(roomId);
      if (room) {
        room.turnStartTime = Date.now();
        io.to(roomId).emit("room-update", room);
      }

      turnTimer = setTimeout(() => {
        const room = rooms.get(roomId);
        if (room && room.gameState === "playing") {
          // Auto skip turn
          room.turn = (room.turn + 1) % room.players.length;
          room.diceValue = null;
          io.to(roomId).emit("room-update", room);
          startTurnTimer(roomId);
          checkAITurn(roomId);
        }
      }, TURN_TIMEOUT);
    }

    socket.on("start-game", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room && room.players.length >= 2) {
        room.gameState = "playing";
        io.to(roomId).emit("room-update", room);
        startTurnTimer(roomId);
        checkAITurn(roomId);
      }
    });

    function getGlobalPosition(color: "red" | "green" | "yellow" | "blue", pos: number) {
      const startIndices = { red: 0, green: 13, yellow: 26, blue: 39 };
      return (startIndices[color] + pos - 1) % 52;
    }

    function isSafeSpot(globalPos: number) {
      const safeGlobals = [0, 8, 13, 21, 26, 34, 39, 47];
      return safeGlobals.includes(globalPos);
    }

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Handle player removal from rooms
    });
  });

  expressApp.all("*", (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
