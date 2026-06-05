import React from "react";
import ScratchOverlay from "./ScratchOverlay";
import { useScratchGame } from "./ScratchGameContext";

const ScratchCard: React.FC = () => {
  const { currentPrize, gameState, scratchPercentage, setScratchPercentage } =
    useScratchGame();

  const handleScratchUpdate = (percentage: number): void => {
    setScratchPercentage(percentage);
  };

  return (
    <div
      className="relative mx-auto
        h-[80px] md:h-[120px]
        w-[150px] md:w-[150px] 
      "
    >
      {/* Prize underneath */}
      <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
        {scratchPercentage > 60 ? (
          currentPrize?.iconImage ? (
            <img
              src={currentPrize.iconImage}
              alt={currentPrize.name}
              className="w-16 h-16 md:w-20 md:h-20 object-contain mt-4"
            />
          ) : (
            <div className="text-5xl sm:text-6xl">{currentPrize?.icon}</div>
          )
        ) : (
          <div className="text-lg">Continue Scratching...</div>
        )}
      </div>

      {/* Scratch overlay */}
      <ScratchOverlay onScratchUpdate={handleScratchUpdate} />

      {/* Progress indicator */}
      {gameState === "scratching" && scratchPercentage > 0 && (
        <div className="absolute -bottom-9 left-0 right-0">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(scratchPercentage, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-100 text-center mt-1 font-medium">
            {Math.round(scratchPercentage)}% scratched
          </p>
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
