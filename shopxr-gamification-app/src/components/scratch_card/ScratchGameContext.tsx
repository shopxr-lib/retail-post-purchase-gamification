import React, { createContext, useContext, useEffect, useState } from "react";
import type { IPrize } from "../../types";
import type {
  GameState,
  PrizeDisplay,
  ScratchGameContextType,
  ScratchGameProviderProps,
} from "./types";
import { useGameStore } from "../../stores/useGameStore";
import { getPrizeMessage } from "../../utils";

//* Prize Logic
const mapPrizeToDisplay = (prize: IPrize): PrizeDisplay => {
  let icon = "";
  let defaultName = prize?.name;
  let iconImage: string | null = null;

  switch (prize.type) {
    case 1:
      iconImage = "/game_assets/scratch/coupon.png";
      break;
    case 2:
      icon = "🎁";
      break;
    case 3:
      icon = "🎉";
      break;
    case 4:
      icon = "🙏";
      defaultName = "Better Luck Next Time";
      break;
  }

  const message = getPrizeMessage(prize);

  return {
    id: prize.id,
    icon,
    type: prize.type,
    name: defaultName,
    message,
    image: (prize.imageFile?.url as string) ?? null,
    iconImage,
  };
};

//* Context for Scratch Game
export const ScratchGameContext = createContext<
  ScratchGameContextType | undefined
>(undefined);

export const ScratchGameProvider: React.FC<ScratchGameProviderProps> = ({
  children,
}) => {
  const prizes = useGameStore((s) => s.prizes);

  const startGameSession = useGameStore((s) => s.startGameSession);
  const addPrizeWon = useGameStore((s) => s.addPrizeWon);

  // Initial Game States
  const [currentGamePrize, setCurrentGamePrize] = useState<PrizeDisplay | null>(null);
  const [isScratchedEnough, setIsScratchedEnough] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [scratchPercentage, setScratchPercentage] = useState<number>(0);

  useEffect(() => {
    const handleScratchComplete = async () => {
      if (isScratchedEnough) {
        const currentPrize = useGameStore.getState().currentPrize;
        if (currentPrize) {
          const result = await addPrizeWon(currentPrize.id);
          if (result.success) {
            const prize = mapPrizeToDisplay(result.prize as IPrize);
            setCurrentGamePrize(prize);
            setGameState("revealed");
          }
          else {
            setGameState("ready")
          }
        }
      }
    };
    handleScratchComplete();
  }, [isScratchedEnough, addPrizeWon]);

  const startNewGame = async () => {
    const result = await startGameSession();
    if (!result.success) {
      setGameState("gameover")
    }
    else {
      const freshPrize = useGameStore.getState().currentPrize;
      const prize = mapPrizeToDisplay(freshPrize as IPrize);
      setCurrentGamePrize(prize);
      setIsScratchedEnough(false);
      setGameState("scratching");
      setScratchPercentage(0);
    }
  };

  const finishScratch = async (): Promise<void> => {
    setIsScratchedEnough(true);
  };

  const value: ScratchGameContextType = {
    currentPrize: currentGamePrize,
    isScratchedEnough,
    gameState,
    scratchPercentage,
    setScratchPercentage,
    startNewGame,
    finishScratch,
    prizes,
  };

  return (
    <ScratchGameContext.Provider value={value}>
      {children}
    </ScratchGameContext.Provider>
  );
};

//* Custom hook to use context
export const useScratchGame = (): ScratchGameContextType => {
  const context = useContext(ScratchGameContext);
  if (!context) {
    throw new Error("useScratchGame must be used within ScratchGameProvider");
  }
  return context;
};
