import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from "react";
import type { GameContextType, GameState, PrizeDetail } from "./types";
import { useGameStore } from "@src/stores/useGameStore";
import type { IPrize } from "@src/types";
import { getPrizeMessage } from "@src/utils";

const GachaponContext = createContext<GameContextType | undefined>(undefined);

export const GachaponProvider = ({ children }: { children: ReactNode }) => {
  const prizes = useGameStore((s) => s.prizes);
  const currentPrize = useGameStore((s) => s.currentPrize);
  const remainingCredit = useGameStore((s) => s.remainingCredit);

  const startGameSession = useGameStore((s) => s.startGameSession);
  const addPrizeWon = useGameStore((s) => s.addPrizeWon);

  // const [chances, setChances] = useState(3);
  const [prize, setPrize] = useState<IPrize | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [isMobile, setIsMobile] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(0);
3
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setCurrentHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build prize details once per prizes array
  const PRIZE_DETAILS = useMemo(
    () =>
      prizes.reduce<Record<number, PrizeDetail>>((acc, prize) => {
        const description = getPrizeMessage(prize);
        acc[prize.id] = {
          name: prize.name,
          description,
        };
        return acc;
      }, {}),
    [prizes],
  );

  const spin = async() => {
    if (remainingCredit && remainingCredit > 0 && gameState === "idle") {
      setGameState('validating')
      const prize = currentPrize as IPrize;
      const result = await addPrizeWon(prize.id);
      if (!result.success) {
        resetGame()
      }
      else if (result.prize) {
        setPrize(result.prize);
      }
      setGameState("spinning");
    }
  };

  const startGame = async () => {
    await startGameSession();
    resetGame();
  };

  const resetGame = () => {
    setPrize(null);
    setGameState("idle")
  }

  return (
    <GachaponContext.Provider
      value={{
        currentPrize: prize,
        PRIZE_DETAILS,
        gameState,
        setGameState,
        isMobile,
        currentHeight,
        spin,
        startGame,
      }}
    >
      {children}
    </GachaponContext.Provider>
  );
};

export const useGacha = (): GameContextType => {
  const context = useContext(GachaponContext);
  if (!context) {
    throw new Error("useGacha must be used within GachaponProvider");
  }
  return context;
};
