"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { LUDO_PATH, HOME_PATHS, START_INDICES } from "@/lib/ludo-config";

export const useLudo = (roomId: string, username: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [myColor, setMyColor] = useState<string>("");

  useEffect(() => {
    const newSocket = io();
    
    newSocket.on("connect", () => {
      setSocket(newSocket);
      newSocket.emit("join-room", { roomId, username });
    });

    newSocket.on("room-update", (updatedRoom) => {
      setRoom(updatedRoom);
      const me = updatedRoom.players.find((p: any) => p.username === username);
      if (me) {
        setMyColor(me.color);
        const currentPlayer = updatedRoom.players[updatedRoom.turn];
        setIsMyTurn(currentPlayer?.username === username);
      }
    });

    newSocket.on("dice-rolled", ({ diceValue, playerIndex }) => {
      setDiceValue(diceValue);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, username]);

  const rollDice = useCallback(() => {
    if (socket && isMyTurn) {
      socket.emit("roll-dice", { roomId });
    }
  }, [socket, isMyTurn, roomId]);

  const moveToken = useCallback((tokenIndex: number) => {
    if (socket && isMyTurn && diceValue) {
      socket.emit("move-token", { roomId, tokenIndex });
    }
  }, [socket, isMyTurn, diceValue, roomId]);

  return {
    room,
    diceValue,
    isMyTurn,
    myColor,
    rollDice,
    moveToken,
    socket
  };
};
