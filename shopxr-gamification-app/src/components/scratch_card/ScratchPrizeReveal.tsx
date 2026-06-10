import React from "react";
import { useScratchGame } from "./ScratchGameContext";
import { useGameStore } from "../../stores/useGameStore";

//* Handle mouse enter for button animations
const handleButtonMouseEnter = (
  e: React.MouseEvent<HTMLButtonElement>,
): void => {
  gsap.to(e.currentTarget, {
    scale: 1.05,
    duration: 0.2,
    ease: "power2.out",
  });
};

//* Handle mouse leave for button animations
const handleButtonMouseLeave = (
  e: React.MouseEvent<HTMLButtonElement>,
): void => {
  gsap.to(e.currentTarget, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out",
  });
};

const ScratchPrizeReveal: React.FC = () => {
  const remainingCredit = useGameStore((s) => s.remainingCredit);
  const gameSession = useGameStore(s => s.gameSession);
  const { currentPrize, isScratchedEnough, gameState, startNewGame } =
    useScratchGame();

  if (!isScratchedEnough || gameState !== "revealed") return null;

  return (
    <div
      className="
        flex flex-col gap-6
        rounded-xl
        py-6 px-6 sm:py-8 sm:px-12 md:py-10 md:px-24
        shadow-lg
        text-center
      "
      style={{
        background:
          "linear-gradient(#232323, #232323) padding-box, linear-gradient(180deg, #FF0BFF 0%, #6859FF 47.12%, #6EFFFF 100%) border-box",
        border: "2px solid transparent",
      }}
    >
      {/* Prize Display */}
      <div className="flex justify-center items-center">
        {currentPrize?.iconImage ? (
            <img
              src={currentPrize.iconImage}
              alt="Prize icon"
              className="w-20 h-20 md:w-32 md:h-32 object-contain"
            />
          ) : (
            <div className="text-6xl sm:text-8xl md:text-9xl">
              {currentPrize?.icon}
            </div>
          )}
      </div>

      {/* Prize Message */}
      {currentPrize?.message && (
        <span
          className="
              text-lg sm:text-xl md:text-2xl
              font-bold
              bg-gradient-to-r from-[#FF0BFF] via-[#8725FF] to-[#69FFFF]
              bg-clip-text text-transparent
            "
        >
          {currentPrize?.message}
        </span>
      )}

      {/* Action Button */}
      {(remainingCredit ? remainingCredit - 1 : 0) >= 1 && (
        <button
          onClick={startNewGame}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          disabled={gameSession.status === 'loading'}
          style={{
            backgroundImage:
              "linear-gradient(111.55deg, #FF0BFF 8.04%, #6853FF 50.47%, #6EFFFF 88.27%)",
          }}
          className="
            w-full sm:w-auto
            text-white
            py-2 sm:py-3 px-8 sm:px-16 md:px-20
            rounded-4xl
            font-semibold
            transition-transform
            hover:scale-105
            active:scale-95
            disabled:bg-gray-600 disabled:cursor-not-allowed
            cursor-pointer
            shadow-md
          "
        >
          {gameSession.status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Starting...
            </span>
          ) : (
            <>Play Again</>
          )}
        </button>
      )}
    </div>
  );
};

export default ScratchPrizeReveal;
