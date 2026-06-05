import type { ReactNode } from "react";
import type { IPrize } from "@src/types";

/* ---------- Base Types ---------- */
export type GamePhase = "initial" | "boxSelected" | "gameOver";

export interface GameState {
  gameStart: boolean;
  gamePhase: GamePhase;
  selectedBox: number | null;
  boxResults: (IPrize | null)[];
}

export type GameAction =
  | { type: "SELECT_BOX"; boxIndex: number; result: IPrize }
  | {type: "RESET_GAME"  }
  | { type: "START_GAME" };

export interface PrizeInfo {
  prize: IPrize;
  text: string;
  imageUrl: string;
}

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  dimensions: { width: number; height: number };
}

export interface TreasureLogicReturn {
  getPrizeInfo: (prize: IPrize) => PrizeInfo;
}

/* ---------- Props ---------- */
export interface GameProviderProps {
  children: ReactNode;
}