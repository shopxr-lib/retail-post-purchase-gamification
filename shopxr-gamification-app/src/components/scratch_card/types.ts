import type { IPrize } from "@src/types";
import type { ReactNode } from "react";

/* ---------- Base Types ---------- */
export interface Prize {
  name: string;
  icon: string;
  probability: number;
  color: string;
}

export type GameState = "ready" | "scratching" | "revealed" | "gameover";

export interface ScratchGameContextType {
  currentPrize: PrizeDisplay | null;
  isScratchedEnough: boolean;
  gameState: GameState;
  scratchPercentage: number;
  setScratchPercentage: (percentage: number) => void;
  startNewGame: () => void;
  finishScratch: () => void;
  prizes: IPrize[];
}

export interface PrizeDisplay {
  id: number;
  type: number;
  discountCode: string | null;
  icon: string;
  iconImage: string | null;
  name: string;
  message: string;
  image: string | null;
}

export interface AudioHook {
  playSound: () => void;
  stopSound: () => void;
}

/* ---------- Props ---------- */
export interface ScratchOverlayProps {
  onScratchUpdate: (percentage: number) => void;
}

export interface ScratchGameProviderProps {
  children: ReactNode;
}