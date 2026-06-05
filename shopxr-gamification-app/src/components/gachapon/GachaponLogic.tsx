import React, { useEffect } from "react";
import { useGacha } from "./GachaponContext";

const GachaponLogic = ({ children }: { children: React.ReactNode }) => {
  const { gameState, setGameState } = useGacha();

  useEffect(() => {
    if (gameState === "spinning") {
      // Time for lever pull and ball to drop/scale
      const timer = setTimeout(() => {
        setGameState("opening");
      }, 500);
      return () => clearTimeout(timer);
    }

    if (gameState === "opening") {
      // Time for the ball to crack open
      const timer = setTimeout(() => {
        setGameState("reward");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState, setGameState]);

  return <>{children}</>;
};

export default GachaponLogic;