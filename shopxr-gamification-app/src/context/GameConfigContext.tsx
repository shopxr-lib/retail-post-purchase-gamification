import React, { createContext, useContext } from "react";
import type { IPrize } from "../types";

interface GameConfig {
  prizes: IPrize[];
  playCount: number;
  initialized: boolean;
  startGameSession: () => Promise<void>;
}

const GameConfigContext = createContext<GameConfig | null>(null);

export const useGameConfig = () => {
  const ctx = useContext(GameConfigContext);
  if (!ctx) {
    throw new Error("useGameConfig must be used inside GameConfigProvider");
  }
  return ctx;
};

export const GameConfigProvider = ({
  prizes,
  playCount,
  children,
  initialized,
  startGameSession
}: GameConfig & { children: React.ReactNode }) => {
  return (
    <GameConfigContext.Provider value={{ prizes, initialized, playCount, startGameSession }}>
      {children}
    </GameConfigContext.Provider>
  );
};
