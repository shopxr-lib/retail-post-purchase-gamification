import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GameType } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerState {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCredits: number;
  hasPurchase: boolean;
}

interface GameResult {
  won: boolean;
  prize: {
    id: string;
    name: string;
    type: number;
    value: number | null;
    customerPrizeId: string | null;
  } | null;
  creditCost: number;
  newBalance: number;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

// ─── Customer Store ───────────────────────────────────────────────────────────

interface CustomerStore {
  customer: CustomerState | null;
  setCustomer: (c: CustomerState) => void;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  setHasPurchase: (v: boolean) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,

      setCustomer: (customer) => set({ customer }),

      setCredits: (totalCredits) =>
        set((s) =>
          s.customer ? { customer: { ...s.customer, totalCredits } } : {}
        ),

      addCredits: (amount) =>
        set((s) =>
          s.customer
            ? { customer: { ...s.customer, totalCredits: s.customer.totalCredits + amount } }
            : {}
        ),

      deductCredits: (amount) =>
        set((s) =>
          s.customer
            ? {
                customer: {
                  ...s.customer,
                  totalCredits: Math.max(0, s.customer.totalCredits - amount),
                },
              }
            : {}
        ),

      setHasPurchase: (hasPurchase) =>
        set((s) =>
          s.customer ? { customer: { ...s.customer, hasPurchase } } : {}
        ),

      clearCustomer: () => set({ customer: null }),
    }),
    {
      name: "gamify-customer",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ customer: s.customer }),
    }
  )
);

// ─── Game Store ───────────────────────────────────────────────────────────────

interface GameStore {
  activeGame: GameType | null;
  isPlaying: boolean;
  lastResult: GameResult | null;
  showResultModal: boolean;

  setActiveGame: (game: GameType | null) => void;
  setIsPlaying: (v: boolean) => void;
  setLastResult: (result: GameResult) => void;
  setShowResultModal: (v: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  activeGame: null,
  isPlaying: false,
  lastResult: null,
  showResultModal: false,

  setActiveGame: (activeGame) => set({ activeGame }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setLastResult: (lastResult) =>
    set({ lastResult, showResultModal: true, isPlaying: false }),
  setShowResultModal: (showResultModal) => set({ showResultModal }),
  resetGame: () =>
    set({ isPlaying: false, lastResult: null, showResultModal: false }),
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  activeModal: string | null;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toasts: [],
      activeModal: null,

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      addToast: (toast) =>
        set((s) => ({
          toasts: [
            ...s.toasts,
            { ...toast, id: Math.random().toString(36).slice(2) },
          ].slice(-5),
        })),

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      openModal: (activeModal) => set({ activeModal }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: "retail-gamify-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
