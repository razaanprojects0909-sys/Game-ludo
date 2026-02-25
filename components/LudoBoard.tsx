"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { LUDO_PATH, HOME_PATHS, START_INDICES, BASE_POSITIONS } from "@/lib/ludo-config";

interface LudoBoardProps {
  tokens: {
    red: number[];
    green: number[];
    yellow: number[];
    blue: number[];
  };
  onTokenClick: (color: string, index: number) => void;
  currentPlayerColor: string;
  isMyTurn: boolean;
  diceValue: number | null;
}

const LudoBoard: React.FC<LudoBoardProps> = ({ 
  tokens, 
  onTokenClick, 
  currentPlayerColor,
  isMyTurn,
  diceValue 
}) => {
  // 15x15 grid
  const grid = Array.from({ length: 15 }, (_, r) =>
    Array.from({ length: 15 }, (_, c) => ({ r, c }))
  );

  const getCellType = (r: number, c: number) => {
    // Bases
    if (r < 6 && c < 6) return "base-red";
    if (r < 6 && c > 8) return "base-green";
    if (r > 8 && c < 6) return "base-blue";
    if (r > 8 && c > 8) return "base-yellow";

    // Home
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return "home";

    // Paths
    if (r === 7 && c > 0 && c < 6) return "path-red-home";
    if (r === 7 && c > 8 && c < 14) return "path-yellow-home";
    if (c === 7 && r > 0 && r < 6) return "path-green-home";
    if (c === 7 && r > 8 && r < 14) return "path-blue-home";

    // Special cells (Starts)
    if (r === 6 && c === 1) return "start-red";
    if (r === 1 && c === 8) return "start-green";
    if (r === 8 && c === 13) return "start-yellow";
    if (r === 13 && c === 6) return "start-blue";

    // Safe spots (Stars)
    const safeSpots = [
      [6, 2], [2, 8], [8, 12], [12, 6],
      [6, 1], [1, 8], [8, 13], [13, 6]
    ];
    if (safeSpots.some(([sr, sc]) => sr === r && sc === c)) return "safe";

    return "path";
  };

  const getCellColor = (type: string) => {
    switch (type) {
      case "base-red": return "bg-red-500";
      case "base-green": return "bg-green-500";
      case "base-blue": return "bg-blue-500";
      case "base-yellow": return "bg-yellow-500";
      case "path-red-home": return "bg-red-200";
      case "path-green-home": return "bg-green-200";
      case "path-yellow-home": return "bg-yellow-200";
      case "path-blue-home": return "bg-blue-200";
      case "start-red": return "bg-red-400";
      case "start-green": return "bg-green-400";
      case "start-yellow": return "bg-yellow-400";
      case "start-blue": return "bg-blue-400";
      case "home": return "bg-white";
      default: return "bg-white";
    }
  };

  const getTokenPosition = (color: string, pos: number, index: number) => {
    if (pos === 0) {
      const basePos = BASE_POSITIONS[color as keyof typeof BASE_POSITIONS][index];
      return { r: basePos[0], c: basePos[1] };
    }

    if (pos > 51) {
      const homePath = HOME_PATHS[color as keyof typeof HOME_PATHS];
      const homePos = homePath[pos - 52];
      if (!homePos) return { r: 7, c: 7 }; // Finished
      return { r: homePos[0], c: homePos[1] };
    }

    const startIndex = START_INDICES[color as keyof typeof START_INDICES];
    const pathIndex = (startIndex + pos - 1) % 52;
    const pathPos = LUDO_PATH[pathIndex];
    return { r: pathPos[0], c: pathPos[1] };
  };

  return (
    <div className="relative w-full max-w-[600px] aspect-square bg-gray-200 border-4 border-gray-800 shadow-2xl rounded-lg overflow-hidden select-none">
      <div className="grid grid-cols-15 grid-rows-15 h-full w-full">
        {grid.flat().map(({ r, c }) => {
          const type = getCellType(r, c);
          const color = getCellColor(type);
          const isSafe = type === "safe" || type.startsWith("start-");

          return (
            <div
              key={`${r}-${c}`}
              className={`border-[0.5px] border-gray-300 flex items-center justify-center relative ${color}`}
            >
              {isSafe && <Star className="w-4 h-4 text-gray-400 opacity-50" />}
              
              {/* Render Bases Content */}
              {r === 1 && c === 1 && type === "base-red" && <BaseBox color="red" />}
              {r === 1 && c === 10 && type === "base-green" && <BaseBox color="green" />}
              {r === 10 && c === 1 && type === "base-blue" && <BaseBox color="blue" />}
              {r === 10 && c === 10 && type === "base-yellow" && <BaseBox color="yellow" />}

              {/* Home Center */}
              {r === 7 && c === 7 && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-full h-full grid grid-cols-2 grid-rows-2 rotate-45 scale-150">
                      <div className="bg-red-500" />
                      <div className="bg-green-500" />
                      <div className="bg-blue-500" />
                      <div className="bg-yellow-500" />
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tokens Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {Object.entries(tokens).map(([color, positions]) =>
          positions.map((pos, index) => {
            const { r, c } = getTokenPosition(color, pos, index);
            const isClickable = isMyTurn && color === currentPlayerColor && diceValue !== null;

            return (
              <motion.div
                key={`${color}-${index}`}
                layoutId={`${color}-${index}`}
                initial={false}
                animate={{
                  top: `${(r / 15) * 100}%`,
                  left: `${(c / 15) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-[6.66%] h-[6.66%] p-1 z-10 pointer-events-auto"
                onClick={() => isClickable && onTokenClick(color, index)}
              >
                <div 
                  className={`w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-transform ${
                    isClickable ? "hover:scale-125 animate-pulse ring-2 ring-white" : ""
                  } ${
                    color === "red" ? "bg-red-600" :
                    color === "green" ? "bg-green-600" :
                    color === "blue" ? "bg-blue-600" :
                    "bg-yellow-600"
                  }`}
                >
                  <div className="w-1/2 h-1/2 rounded-full bg-white/30" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

const BaseBox = ({ color }: { color: string }) => {
  const bgColor = {
    red: "bg-red-600",
    green: "bg-green-600",
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
  }[color as "red" | "green" | "blue" | "yellow"];

  return (
    <div className={`absolute inset-2 ${bgColor} rounded-lg border-4 border-white/30 flex items-center justify-center`}>
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/30" />
        ))}
      </div>
    </div>
  );
};

export default LudoBoard;
