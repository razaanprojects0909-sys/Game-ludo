"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";

interface DiceProps {
  value: number | null;
  onRoll: () => void;
  disabled: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, onRoll, disabled }) => {
  const controls = useAnimation();
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = async () => {
    if (disabled || isRolling) return;
    setIsRolling(true);
    
    // Animation
    await controls.start({
      rotate: [0, 90, 180, 270, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 },
    });
    
    onRoll();
    setIsRolling(false);
  };

  const renderDots = (val: number) => {
    const dots = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    }[val as 1 | 2 | 3 | 4 | 5 | 6] || [];

    return Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className={`w-2 h-2 rounded-full ${dots.includes(i) ? "bg-gray-800" : "bg-transparent"}`} />
    ));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={controls}
        onClick={handleRoll}
        className={`w-16 h-16 bg-white rounded-xl shadow-lg border-2 border-gray-200 cursor-pointer flex items-center justify-center p-2 grid grid-cols-3 gap-1 ${
          disabled ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-105 active:scale-95"
        }`}
      >
        {value ? renderDots(value) : <div className="col-span-3 text-gray-400 text-xs text-center">Roll</div>}
      </motion.div>
    </div>
  );
};

export default Dice;
