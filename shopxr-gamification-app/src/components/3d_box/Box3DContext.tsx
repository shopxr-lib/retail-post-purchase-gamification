import type { IPrize } from "@src/types";
import { createContext, useContext, useState, type FC } from "react";
import type { Box3DContextType, Box3DProviderProps } from "./types";
import { useGameStore } from "@src/stores/useGameStore";
import { getPrizeMessage } from "@src/utils";

const Box3DContext = createContext<Box3DContextType | undefined>(undefined);

export const Box3DProvider: FC<Box3DProviderProps> = ({ children }) => {
  const prizes = useGameStore((s) => s.prizes);
  const currentPrize = useGameStore((s) => s.currentPrize);
  const startGameSession = useGameStore((s) => s.startGameSession);
  const addPrizeWon = useGameStore((s) => s.addPrizeWon);

  //* Game's initial states
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [boxAnimationActive, setBoxAnimationActive] = useState<boolean>(false);

  //* Box shaking states
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [boxClicked, setBoxClicked] = useState<boolean>(false);

  //* Prize states
  const [currentGamePrize, setCurrentGamePrize] = useState<IPrize | null>(null);

  //* Gold brick states
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  const generatePrizeOutcome = (prize: IPrize): IPrize => {
    const message = getPrizeMessage(prize);
    return { ...prize, message };
  };

  //* Box click function
  const handleBoxClick = async(): Promise<void> => {
    // Only allow clicks when game is active and box is not already animating or shaking
    if (
      gameStarted &&
      !boxAnimationActive &&
      !isShaking && currentPrize
    ) {
      const result = await addPrizeWon(currentPrize?.id);
      if (!result.success) {
        setGameStarted(false);
      }
      else if (result.prize) {
        const prize = generatePrizeOutcome(result.prize);
        setCurrentGamePrize(prize);
        setBoxClicked(true);
        setIsShaking(true);
        // Wait for the final shake animation to complete, then open box
        setTimeout(async () => {
          // Start box opening animation
          setBoxAnimationActive(true);
          setShowWinModal(true);
        }, 800); // Wait for shake animation to complete
      }
    }
  };


  //* Start game function
  const startGame = async () => {
    await startGameSession();
    setGameStarted(true);
    setBoxAnimationActive(false);
    setIsShaking(false);
    setCurrentGamePrize(null);
    setShowWinModal(false);
    setBoxClicked(false);
  };

  //* Context values
  const contextValue: Box3DContextType = {
    gameStarted,
    boxAnimationActive,
    isShaking,
    boxClicked,
    currentPrize: currentGamePrize,
    showWinModal,
    setBoxAnimationActive,
    setIsShaking,
    handleBoxClick,
    startGame,
    prizes,
  };

  return (
    <Box3DContext.Provider value={contextValue}>
      {children}
    </Box3DContext.Provider>
  );
};

//* Custom hook to use Box Game Context
export const useBox3D = (): Box3DContextType => {
  const context = useContext(Box3DContext);
  if (!context) {
    throw new Error("useBox3D must be used within a Box3DProvider");
  }

  return context;
};
