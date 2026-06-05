import React, { createContext, useContext, useReducer } from "react";
import type { GameAction, GameContextType, GameProviderProps, GameState } from "./types";

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

const initialState: GameState = {
  gameStart: false,
  gamePhase: "initial",
  selectedBox: null,
  boxResults: [null, null, null],
};

//* Game state reducer - handles all state changes
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SELECT_BOX":
      return {
        ...state,
        gamePhase: "boxSelected",
        selectedBox: action.boxIndex,
        boxResults: state.boxResults.map((result, index) =>
          index === action.boxIndex ? action.result : result,
        ),
      };
    case "START_GAME":
      return {
        ...initialState,
        gameStart: true,
      }
    case "RESET_GAME":
      return {
        ...initialState,
        gameStart: false,
      }
    default:
      return state;
  }
};

//* Context Provider Component
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });

  // Update dimensions on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, dimensions }}>
      {children}
    </GameContext.Provider>
  );
};

//* Custom hook to use game context
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};
