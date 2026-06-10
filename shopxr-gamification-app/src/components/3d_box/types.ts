import type { IPrize } from "../../types";
import type { ReactNode } from "react";

/* ---------- Base Types ---------- */
export interface Box3DContextType {
  // Game states
  gameStarted: boolean;
  // gameOver: boolean;
  boxAnimationActive: boolean;
  prizes: IPrize[];

  // Box Shaking States
  isShaking: boolean;
  boxClicked: boolean;

  // Prize States
  currentPrize: IPrize | null;

  showWinModal: boolean;

  // State Setters
  setBoxAnimationActive: (active: boolean) => void;
  setIsShaking: (shaking: boolean) => void;

  // Game Functions
  handleBoxClick: () => void;
  // playAgain: () => void;
  startGame: () => void;
  // resetGame: () => void;
}


/* ---------- Props ---------- */
export interface Box3DProviderProps {
  children: ReactNode;
}