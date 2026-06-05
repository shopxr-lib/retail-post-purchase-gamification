import { createContext, useContext, useReducer, useMemo, useState, useEffect } from "react";
import type { IPrize } from "@src/types";
import type {
  BlindBoxContextType,
  BlindBoxProviderProps,
  GameAction,
  GameState,
  PrizeDetail,
} from "./types";
import { useGameStore } from "@src/stores/useGameStore";
import { getPrizeMessage } from "@src/utils";

// Initial game state
const initialState: GameState = {
  totalChances: 3,
  gameStart: false,
  remainingChances: 3,
  currentPrize: null,
  gamePhase: "initial",
  selectedBoxIndex: -1,
  isAnimating: false,
  prizesWon: [],
};

// Reducer function to manage state changes
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_BOX":
      return {
        ...state,
        selectedBoxIndex: action.payload,
        gamePhase: "boxSelected",
        isAnimating: true,
      };

    case "REVEAL_PRIZE":
      return {
        ...state,
        prizesWon: [...state.prizesWon, action.payload.id],
        currentPrize: action.payload,
        gamePhase: "prizeRevealed",
        isAnimating: false,
      };

    case "START_GAME":
      return {
        ...initialState,
        gameStart: true,
      };

    case "RESET_GAME": 
      return {
        ...initialState,
        gameStart: false
      }

    default:
      return state;
  }
}

// Create context
const BlindBoxContext = createContext<BlindBoxContextType | undefined>(
  undefined,
);

export function BlindBoxProvider({
  children,
}: BlindBoxProviderProps): JSX.Element {
  const prizes = useGameStore((s) => s.prizes);
  const currentPrize = useGameStore((s) => s.currentPrize);

  const startGameSession = useGameStore((s) => s.startGameSession);
  const addPrizeWon = useGameStore((s) => s.addPrizeWon);

  const [state, dispatch] = useReducer(gameReducer, initialState);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  // Game action functions
  const selectBox = async(boxIndex: number): Promise<void> => {
    if (state.isAnimating || state.gamePhase !== "initial") return;

    const prize = currentPrize as IPrize;
    const result = await addPrizeWon(prize.id);
    if (!result.success) {
      dispatch({ type: "RESET_GAME" })    
    }
    else if (result.prize) {
      dispatch({ type: "SELECT_BOX", payload: boxIndex });
  
      // Reveal prize after a delay to sync with animation
      setTimeout(async () => {
        dispatch({ type: "REVEAL_PRIZE", payload: result.prize! });
      }, 2000); // 2 second delay for box animation
    }
  };

  const handleStartGame = async () => {
    await startGameSession();
    dispatch({ type: "START_GAME" });
  };

  const setAnimating = (isAnimating: boolean): void => {
    dispatch({ type: "SET_ANIMATING", payload: isAnimating });
  };

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

  // Context value object
  const contextValue: BlindBoxContextType = {
    ...state,
    PRIZE_DETAILS,
    prizes,
    selectBox,
    handleStartGame,
    dimensions,
    setAnimating,
  };

  return (
    <BlindBoxContext.Provider value={contextValue}>
      {children}
    </BlindBoxContext.Provider>
  );
}

// Custom hook to use the context
export function useBlindBox(): BlindBoxContextType {
  const context = useContext(BlindBoxContext);
  if (!context) {
    throw new Error("useBlindBox must be used within a BlindBoxProvider");
  }
  return context;
}
