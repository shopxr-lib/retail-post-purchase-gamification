import { create } from "zustand";
import { getGameData, startGameSession } from "@src/api";
import { addPrizeWon } from "@src/api/game";
import type { IPrize, IWidgetSettings } from "@src/types";
import { ScreenPosition } from "@src/constants/enums";

interface GameState {
  gameData: {
    loading: boolean;
    error?: string | null;
  };
  gameSession: {
    status?: "idle" | "loading" | "playing";
    error?: string | null;
  };
  initialized: boolean;
  remainingCredit: number | null;
  prizes: IPrize[];
  currentPrize: IPrize | null;
  widgetSettings: IWidgetSettings | null;
  playCount: number | null;
  selectedGame: number | null;
  expired: boolean;

  fetchGameData: () => Promise<void>;
  startGameSession: () => Promise<{ success: boolean }>;
  addPrizeWon: (
    prizeID: number,
  ) => Promise<{ success: boolean; prize?: IPrize }>;
  endGameSession: () => Promise<void>;
  setState: (
    partial: Partial<GameState> | ((state: GameState) => Partial<GameState>),
  ) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameData: {
    loading: true,
    error: null,
  },
  gameSession: {
    status: "idle",
    error: null,
  },
  initialized: false,
  remainingCredit: null,
  prizes: [],
  currentPrize: null,
  widgetSettings: null,
  playCount: null,
  selectedGame: null,
  expired: false,

  setState: (partial) =>
    set((state) =>
      typeof partial === "function"
        ? { ...state, ...partial(state) }
        : { ...state, ...partial },
    ),

  fetchGameData: async () => {
    set({ gameData: { loading: true, error: null } });
    const game = await getGameData();

    if (game.error) {
      set({ gameData: { loading: false, error: game.error as string } });
    } else {
      const { gameDetails, widgetSettings } = game.data;
      set({
        selectedGame: gameDetails.selectedGame,
        remainingCredit: gameDetails.remainingCredit,
        prizes: gameDetails.prizes,
        playCount: gameDetails.playCount,
        expired: gameDetails.expired,
        gameData: {
          loading: false,
        },
        widgetSettings: {
          creditPerAmount: widgetSettings.creditPerAmount,
          iconDisplay: true,
          iconBg: "#000000",
          iconColor: "#ffffff",
          position: ScreenPosition.Right,
          verticalPosVal: 25,
          horizontalPosVal: 25,
        }
      });
    }
  },

  startGameSession: async () => {
    set({ gameSession: { status: "loading" } });
    const state = get();
    const gameType = state.selectedGame;
    const game = await startGameSession(gameType as number);

    if (game.error) {
      set({ gameSession: { status: "idle", error: game.error as string } });
      return { success: false };
    } else {
      const {
        success,
        invalid,
        remainingCredit,
        playCount,
        expired,
        prizes,
        selectedGame,
        currentPrize,
      } = game.data;
      if (!success) {
        if (expired) {
          set({ expired });
          return { success: false };
        }
        else if (invalid) {
          set({
            gameSession: { status: "playing" },
            selectedGame: selectedGame,
            initialized: false
          })
          return { success: false }
        }
      }
      set((state) => ({
        initialized: state.selectedGame === selectedGame ? true : false,
        remainingCredit,
        selectedGame: selectedGame,
        playCount,
        expired,
        prizes,
        currentPrize,
        gameSession: { status: "playing" },
      }));
      return { success: !expired };
    }
  },

  addPrizeWon: async (
    prizeID: number,
  ): Promise<{
    success: boolean;
    prize?: IPrize;
    expired?: boolean;
    campaign?: { gameType: number };
  }> => {
    set({ gameSession: { status: "loading" } });

    const state = get();
    const gameType = state.selectedGame;
    const response = await addPrizeWon(prizeID, gameType!);
    if (response.error) {
      set({ gameSession: { error: response.error } });
      return { success: false };
    } else if (response.data) {
      const { success, expired, prize, selectedGame, invalid } = response.data;
      if (!success) {
        if (expired) {
          set({ expired });
          return { success: false };
        }
        else if (invalid) {
          set({
            gameSession: { status: "playing" },
            selectedGame,
            initialized: false
          })
          return { success: false }
        }
        set({
          gameSession: { status: "playing" },
          initialized: false
        })
        return { success: false }
      } else {
        set((state) => ({
          gameSession: { status: "playing" },
          currentPrize: prize,
          selectedGame,
          initialized: state.selectedGame === selectedGame ? true : false,
        }));
        return { success: true, prize };
      }
    }
    return { success: false };
  },

  endGameSession: async () => {
    await set({ initialized: false });
  },
}));
