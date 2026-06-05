"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useCustomerStore, useGameStore, useUIStore } from "@/stores";
import { playGame } from "@/actions/games/play-actions";
import { redeemQRCode } from "@/actions/qr/qr-actions";

// ─── useGamePlay ──────────────────────────────────────────────────────────────

export function useGamePlay(gameType: number, campaignId: string) {
  const { customer, deductCredits, setCredits } = useCustomerStore();
  const { setIsPlaying, setLastResult, isPlaying } = useGameStore();
  const { addToast } = useUIStore();

  const canPlay = !!(
    customer &&
    customer.totalCredits > 0 &&
    customer.hasPurchase
  );

  const play = useCallback(async () => {
    if (!canPlay || isPlaying) return;

    setIsPlaying(true);

    try {
      const result = await playGame(gameType, campaignId);

      if ("error" in result) {
        addToast({ type: "error", title: "Game Error", message: result.error });
        setIsPlaying(false);
        return;
      }

      // Optimistic update
      setCredits(result.newBalance);
      setLastResult(result);

      if (result.won) {
        addToast({
          type: "success",
          title: "🎉 You won!",
          message: result.prize?.name ?? "Congratulations!",
          duration: 6000,
        });
      }
    } catch {
      addToast({ type: "error", title: "Error", message: "Something went wrong" });
      setIsPlaying(false);
    }
  }, [canPlay, isPlaying, gameType, campaignId]);

  return { canPlay, isPlaying, play };
}

// ─── useQRScanner ─────────────────────────────────────────────────────────────

export function useQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addCredits, setHasPurchase } = useCustomerStore();
  const { addToast } = useUIStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<unknown>(null);
  const hasScannedRef = useRef(false);

  const startScanning = useCallback(async () => {
    setError(null);
    setIsScanning(true);
    hasScannedRef.current = false;

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;

      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      const deviceId = devices.find((d) =>
        d.label.toLowerCase().includes("back")
      )?.deviceId ?? devices[0]?.deviceId;

      if (!deviceId) throw new Error("No camera found");

      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        async (result, err) => {
          if (err || !result || hasScannedRef.current) return;
          hasScannedRef.current = true;

          stopScanning();
          setIsProcessing(true);

          const code = result.getText();
          const response = await redeemQRCode(code);

          setIsProcessing(false);

          if ("error" in response) {
            setError(response.error ?? "Something went wrong");
            hasScannedRef.current = false;
          } else {
            addCredits(response.creditsEarned);
            setHasPurchase(true);
            addToast({
              type: "success",
              title: `+${response.creditsEarned} credits!`,
              message: "QR code scanned successfully",
              duration: 5000,
            });
          }
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Camera error";
      setError(message);
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      (readerRef.current as { reset?: () => void }).reset?.();
      readerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => () => stopScanning(), [stopScanning]);

  return { videoRef, isScanning, isProcessing, error, startScanning, stopScanning };
}

// ─── usePagination ────────────────────────────────────────────────────────────

export function usePagination(totalItems: number, itemsPerPage: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  return {
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── useDebounce ──────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─── useCredits ───────────────────────────────────────────────────────────────

export function useCredits() {
  const { customer } = useCustomerStore();
  return {
    credits: customer?.totalCredits ?? 0,
    hasPurchase: customer?.hasPurchase ?? false,
    canPlay: (customer?.totalCredits ?? 0) > 0 && (customer?.hasPurchase ?? false),
  };
}
