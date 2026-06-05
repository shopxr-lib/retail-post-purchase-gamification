import type { IPrize } from "@src/types";

export type GameState = 'idle' | 'validating' | 'spinning' | 'opening' | "reward";

export interface PrizeDetail {
  name: string;
  description: string;
}

export interface GameContextType {
  // Game states
  gameState: GameState;
  setGameState: (state: GameState) => void;
  isMobile: boolean;
  currentHeight: number;

  // Prize states
  PRIZE_DETAILS: Record<number, PrizeDetail>;
  currentPrize: IPrize | null;

  // Game Functions
  spin: () => void;
  startGame: () => void;
}
