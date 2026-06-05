import React, { useEffect, useRef } from "react";
import { useScratchGame } from "./ScratchGameContext";
import type { AudioHook, ScratchOverlayProps } from "./types";

const ScratchOverlay: React.FC<ScratchOverlayProps> = ({ onScratchUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const { gameState, finishScratch } = useScratchGame();

  // Audio Hook for Scratch Sounds
  const useAudio = (): AudioHook => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isPlayingRef = useRef<boolean>(false);

    useEffect(() => {
      // Try to load local file first, fallback to online source
      const loadAudio = (): void => {
        const audio = new Audio();

        // Try local file first
        audio.src = "/game_assets/scratch/scratch.mp3";

        // If local file fails to load, use online source
        audio.addEventListener("error", () => {
          // Extract audio URL from Vocaroo embed
          audio.src = "https://media.vocaroo.com/mp3/19YLgKiJKYyr";
        });

        audio.loop = true;
        audio.volume = 0.5;
        audio.preload = "auto";
        audioRef.current = audio;
      };

      loadAudio();

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, []);

    const playSound = (): void => {
      if (audioRef.current && !isPlayingRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          // .catch((e: unknown) => {});
        isPlayingRef.current = true;
      }
    };

    const stopSound = (): void => {
      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        isPlayingRef.current = false;
      }
    };

    return { playSound, stopSound };
  };

  const { playSound, stopSound } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset drawing state when canvas is reinitialized
    isDrawing.current = false;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with scratch-off layer
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch texture
    ctx.fillStyle = "#7D7D7D00";
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2,
      );
    }

    // Add "SCRATCH HERE" text
    ctx.fillStyle = "#e6e3e3";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.font = "16px Arial";
  }, [gameState]);

  const calculateScratchedArea = (): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }

    return (transparent / (data.length / 4)) * 100;
  };

  const scratch = (e: MouseEvent | TouchEvent): void => {
    if (gameState !== "scratching") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    let x: number, y: number;
    if (e.type.includes("touch")) {
      const touchEvent = e as TouchEvent;
      x = touchEvent.touches[0].clientX - rect.left;
      y = touchEvent.touches[0].clientY - rect.top;
    } else {
      const mouseEvent = e as MouseEvent;
      x = mouseEvent.clientX - rect.left;
      y = mouseEvent.clientY - rect.top;
    }

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
    ctx.fill();

    const percentage = calculateScratchedArea();
    onScratchUpdate(percentage);

    if (percentage > 60) {
      stopSound();
      finishScratch();
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent): void => {
    e.preventDefault();
    isDrawing.current = true;
    playSound();
    scratch(e.nativeEvent);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent): void => {
    e.preventDefault();
    if (isDrawing.current) {
      scratch(e.nativeEvent);
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent): void => {
    e.preventDefault();
    isDrawing.current = false;
    stopSound();
  };

  if (gameState !== 'scratching') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full touch-none scratch-cursor rounded-xl"
      style={{ touchAction: "none" }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    />
  );
};

export default ScratchOverlay;
