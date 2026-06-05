"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCustomerStore } from "@/stores";
import { QRScannerSection } from "@/components/customer/QRScannerSection";
import { GamesSection } from "@/components/customer/GamesSection";
import { RewardsSection } from "@/components/customer/RewardsSection";

interface Props {
  customer: {
    id: string; name: string; email: string;
    phone: string; totalCredits: number; hasPurchase: boolean;
  };
  campaign: { id: string; name: string; endDate: Date | null; gameType: number } | null;
  prizes: Array<{
    id: string; claimStatus: string; wonAt: Date; claimedAt: Date | null;
    prize: { name: string; type: number; value: unknown };
    claimedBy: { name: string; store: string } | null;
    prizeSnapshot: { name: string; type: number; value: string | null } | null;
  }>;
}

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.09 } } },
  item: { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

export function CustomerDashboardClient({ customer, campaign, prizes }: Props) {
  const { setCustomer } = useCustomerStore();
  useEffect(() => { setCustomer(customer); }, [customer, setCustomer]);

  return (
    <motion.div
      className="space-y-5"
      variants={stagger.container}
      initial="initial"
      animate="animate"
    >
      {/* Campaign banner */}
      {campaign && (
        <motion.div variants={stagger.item}>
          <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-4 shadow-lg shadow-brand-500/20">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-brand-100 font-medium">Active Campaign</p>
                <p className="text-sm font-semibold text-white">{campaign.name}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-xs text-green-200 font-medium">Live</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!campaign && (
        <motion.div variants={stagger.item}>
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 text-center">
            <p className="text-sm text-slate-400">No active campaign right now. Check back soon!</p>
          </div>
        </motion.div>
      )}

      {/* QR Scanner */}
      <motion.div variants={stagger.item}>
        <QRScannerSection />
      </motion.div>

      {/* Games */}
      {campaign && (
        <motion.div variants={stagger.item}>
          <GamesSection
            customerId={customer.id}
            campaignId={campaign.id}
            gameType={campaign.gameType}
            hasPurchase={customer.hasPurchase}
          />
        </motion.div>
      )}

      {/* Rewards */}
      <motion.div variants={stagger.item}>
        <RewardsSection prizes={prizes} />
      </motion.div>
    </motion.div>
  );
}
