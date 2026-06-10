"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, useCustomerStore } from "@/stores";
import { GameResultModal } from "./GameResultModal";
import { GAME_CONFIG, GAME_LABELS } from "@/constants";

export function GamesSection({
  customerId,
  campaignId,
  gameType,
  hasPurchase,
}: {
  customerId: string;
  campaignId: string;
  gameType: number;
  hasPurchase: boolean;
}) {
  const { customer } = useCustomerStore();
  const { showResultModal, lastResult, setShowResultModal } = useGameStore();
  const canPlay = hasPurchase && (customer?.totalCredits ?? 0) > 0;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Active Game</h2>
        {!canPlay && (
          <span className="text-xs text-slate-400">
            {!hasPurchase ? "Scan a QR to unlock" : "No credits remaining"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 * 0.07 }}
        >
          <GameCard
            customerId={customerId}
            gameType={gameType}
            campaignId={campaignId}
            canPlay={canPlay}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {showResultModal && lastResult && (
          <GameResultModal result={lastResult} onClose={() => setShowResultModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function GameCard({
  customerId,
  gameType,
  campaignId,
  canPlay,
}: {
  customerId: string;
  gameType: number;
  campaignId: string;
  canPlay: boolean;
}) {
  const config = GAME_CONFIG[GAME_LABELS[gameType]];

  return (
    <motion.button
      onClick={
        canPlay
          ? () => window.open(`${process.env.NEXT_PUBLIC_GAME_URL}/?token=${customerId}&campaignId=${campaignId}`, "_blank")
          : undefined
      }
      disabled={!canPlay}
      whileHover={canPlay ? { scale: 1.01, y: -1 } : {}}
      whileTap={canPlay ? { scale: 0.98 } : {}}
      style={{ "--glow-color": config.glowColor } as React.CSSProperties}
      className={`w-full rounded-2xl border-2 bg-gradient-to-r p-4 text-left shadow-sm transition-all duration-200 ${
        canPlay
          ? `${config.bg} game-card-glow cursor-pointer hover:shadow-md`
          : "cursor-not-allowed border-slate-100 from-slate-50 to-slate-50 opacity-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{config.label}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-400">{config.description}</p>
        </div>
        <div className="text-slate-300">
          {canPlay ? (
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
        </div>
      </div>
    </motion.button>
  );
}
