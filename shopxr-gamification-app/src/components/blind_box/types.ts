import type { IPrize } from "../../types";
import type { ReactNode } from "react";

/* ---------- Base Types ---------- */
export type GamePhase =
  | "initial"
  | "boxSelected"
  | "prizeRevealed"
  | "gameOver";
  
export interface PrizeDetail {
  name: string;
  description: string;
}

export interface GameState {
  totalChances: number;
  gameStart: boolean;
  remainingChances: number;
  currentPrize: IPrize | null;
  gamePhase: GamePhase;
  selectedBoxIndex: number;
  isAnimating: boolean;
  prizesWon: number[],
}

export type GameAction =
  | { type: "SELECT_BOX"; payload: number }
  | { type: "REVEAL_PRIZE"; payload: IPrize }
  | { type: "START_GAME" }
  | { type: "RESET_GAME" }
  | { type: "SET_ANIMATING"; payload: boolean };

export interface BlindBoxContextType extends GameState {
  PRIZE_DETAILS: Record<number, PrizeDetail>;
  prizes: IPrize[];
  selectBox: (boxIndex: number) => void;
  handleStartGame: () => void;
  setAnimating: (isAnimating: boolean) => void;
  dimensions: { width: number; height: number };
}

/* ---------- Props ---------- */
export interface BlindBoxProviderProps {
  children: ReactNode;
}

export interface TreasureBoxProps {
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
  disabled: boolean;
  boxRef: (el: HTMLDivElement | null) => void;
  dimensions: { width: number; height: number };
}