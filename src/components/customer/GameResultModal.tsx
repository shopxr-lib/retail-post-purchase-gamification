"use client";

import { motion } from "framer-motion";

interface GameResult {
  won: boolean;
  prize: { name: string; type: number; value: number | null } | null;
  newBalance: number;
  creditCost: number;
}

export function GameResultModal({ result, onClose }: { result: GameResult; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl"
      >
        {result.won ? (
          <>
            <div className="relative mb-4">
              {["🎉","✨","🌟","🎊"].map((e, i) => (
                <motion.span key={i} className="absolute text-2xl" initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{ opacity: [0,1,0], y: -60, x: (i % 2 === 0 ? 1 : -1) * (20 + i * 15) }}
                  transition={{ delay: i * 0.1, duration: 1 }} style={{ top: "50%", left: "50%" }}>
                  {e}
                </motion.span>
              ))}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200 text-5xl"
              >🏆</motion.div>
            </div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-slate-800 mb-1">
              You won!
            </motion.h2>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-lg font-semibold text-amber-700">{result.prize?.name}</p>
              {result.prize?.value && <p className="text-sm text-amber-500/80 mt-0.5">Value: RM{result.prize.value}</p>}
            </motion.div>
            <p className="mt-3 text-xs text-slate-400">Visit any outlet to claim your prize</p>
          </>
        ) : (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
              className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-5xl mb-4">
              😔
            </motion.div>
            <h2 className="text-xl font-bold text-slate-800">Not this time</h2>
            <p className="mt-2 text-sm text-slate-500">
              Better luck next time! You have <span className="font-semibold text-brand-600">{result.newBalance} credit{result.newBalance !== 1 ? "s" : ""}</span> remaining.
            </p>
          </>
        )}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-slate-100 py-3 text-sm font-medium text-slate-600 hover:bg-slate-200 transition">
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
