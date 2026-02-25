"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Users, Shield, Settings, Play, User as UserIcon } from "lucide-react";
import LudoBoard from "@/components/LudoBoard";
import Dice from "@/components/Dice";
import { useLudo } from "@/hooks/useLudo";

import confetti from "canvas-confetti";

import { Howl } from "howler";

const sounds = {
  dice: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3"] }),
  move: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3"] }),
  cut: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3"] }),
  win: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3"] }),
};

export default function LudoGame() {
  const [gameState, setGameState] = useState<"lobby" | "playing">("lobby");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("default-room");

  const { room, diceValue, isMyTurn, myColor, rollDice, moveToken, socket } = useLudo(roomId, username);

  useEffect(() => {
    if (diceValue) sounds.dice.play();
  }, [diceValue]);

  useEffect(() => {
    if (room?.gameState === "finished") {
      sounds.win.play();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [room?.gameState]);

  const handleJoin = () => {
    if (username.trim()) {
      setGameState("playing");
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit("start-game", { roomId });
    }
  };

  const handleAddAI = () => {
    if (socket) {
      socket.emit("add-ai", { roomId });
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  if (gameState === "lobby") {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#1e293b] rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-3xl rotate-12 flex items-center justify-center shadow-lg">
              <Trophy className="w-12 h-12 text-white -rotate-12" />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tighter mb-2">LUDO ROYALE</h1>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Premium Multiplayer Experience</p>
            </div>

            <div className="w-full space-y-4 mt-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Room ID (Optional)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <button 
                onClick={handleJoin}
                disabled={!username.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Play className="w-6 h-6 fill-current" />
                START GAME
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl text-sm font-semibold transition-all">
                <Users className="w-4 h-4" />
                FRIENDS
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl text-sm font-semibold transition-all">
                <Settings className="w-4 h-4" />
                SETTINGS
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      {/* Left Sidebar: Players */}
      <div className="w-full lg:w-64 flex flex-col gap-4">
        <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/10">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Players</h2>
          <div className="space-y-3">
            {room?.players.map((player: any, idx: number) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  room.turn === idx ? "bg-white/10 border-white/20" : "bg-transparent border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  player.color === "red" ? "bg-red-500" :
                  player.color === "green" ? "bg-green-500" :
                  player.color === "blue" ? "bg-blue-500" :
                  "bg-yellow-500"
                }`}>
                  {player.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{player.username}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{player.color}</p>
                </div>
                {room.turn === idx && (
                  <motion.div 
                    layoutId="turn-indicator"
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/10">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Game Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Room ID</span>
              <span className="font-mono font-bold">{roomId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mode</span>
              <span className="font-bold">Multiplayer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-1 flex flex-col items-center gap-6">
        {room?.gameState === "waiting" ? (
          <div className="w-full max-w-[600px] aspect-square bg-[#1e293b] rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-8 p-12 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2">Waiting for Players</h2>
              <p className="text-slate-400">Need at least 2 players to start the royale.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {room.players.map((p: any, i: number) => (
                <div key={i} className="px-4 py-2 bg-white/5 rounded-full text-sm font-bold border border-white/10">
                  {p.username}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleStartGame}
                disabled={room.players.length < 2}
                className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all"
              >
                START BATTLE
              </button>
              <button 
                onClick={handleAddAI}
                disabled={room.players.length >= 4}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border border-white/10 transition-all"
              >
                ADD AI BOT
              </button>
            </div>
          </div>
        ) : room?.gameState === "finished" ? (
          <div className="w-full max-w-[600px] aspect-square bg-[#1e293b] rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-8 p-12 text-center">
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-4xl font-black mb-2 uppercase">{room.winner} WINS!</h2>
              <p className="text-slate-400">The battle has ended. Glory to the victor.</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-4 bg-white text-[#0f172a] font-black rounded-2xl shadow-xl transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <LudoBoard 
            tokens={room?.tokens || { red: [0,0,0,0], green: [0,0,0,0], yellow: [0,0,0,0], blue: [0,0,0,0] }}
            onTokenClick={(color, index) => moveToken(index)}
            currentPlayerColor={myColor}
            isMyTurn={isMyTurn}
            diceValue={diceValue}
          />
        )}
      </div>

      {/* Right Sidebar: Controls */}
      <div className="w-full lg:w-64 flex flex-col gap-4">
        <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/10 flex flex-col items-center gap-6 relative overflow-hidden">
          {/* Timer Progress Bar */}
          {room?.gameState === "playing" && (
            <motion.div 
              key={room.turn + "-" + room.turnStartTime}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 15, ease: "linear" }}
              className="absolute top-0 left-0 h-1 bg-emerald-500"
            />
          )}

          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Turn</h2>
          
          <Dice 
            value={diceValue} 
            onRoll={rollDice} 
            disabled={!isMyTurn || diceValue !== null} 
          />

          <div className="text-center">
            <p className={`text-lg font-black ${isMyTurn ? "text-emerald-500" : "text-slate-500"}`}>
              {isMyTurn ? "ROLL THE DICE!" : "WAITING..."}
            </p>
            {diceValue && isMyTurn && (
              <p className="text-xs text-slate-400 mt-1 animate-bounce">SELECT A TOKEN TO MOVE</p>
            )}
          </div>
        </div>

        <button 
          onClick={() => setGameState("lobby")}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-2xl border border-red-500/20 transition-all"
        >
          QUIT GAME
        </button>
      </div>
    </div>
  );
}
