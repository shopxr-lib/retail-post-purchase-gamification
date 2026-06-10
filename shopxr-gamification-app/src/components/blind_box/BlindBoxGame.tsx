import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useBlindBox } from "./BlindBoxContext";
import { XIcon } from "lucide-react";
import type { TreasureBoxProps } from "./types";
import { useGameStore } from "../../stores/useGameStore";
import { GameCheckpoint, BlindBoxIcon, Loader } from "../../components";
import type { IPrize } from "../../types";
import { getGameHeader } from "../../utils";

function TreasureBox({
  index,
  isSelected,
  onClick,
  disabled,
  boxRef,
  dimensions,
}: TreasureBoxProps): JSX.Element {
  const tiltDirection = index % 2 === 0 ? "hover:-rotate-8" : "hover:rotate-8";
  const { height, width } = dimensions;
  return (
    <div
      ref={boxRef}
      className={`cursor-pointer transition-transform duration-200 hover:scale-135 ${tiltDirection}
                 ${disabled ? "cursor-not-allowed opacity-50" : ""}
                 ${isSelected ? "z-20" : "z-10"}`}
      onClick={() => !disabled && onClick(index)}
    >
      <img
        src="/game_assets/blind_box/blind_box2.webp"
        alt={`Treasure Box ${index + 1}`}
        className={`object-contain drop-shadow-lg ${isSelected 
          ? width >= 2500 ? "h-84 w-84" : width >= 1440 && height > 900 ? "h-64 w-64" : width >= 1280 ? "h-44 w-44" : width >= 1000 && height > 770 ? "h-64 w-64" : width >= 800 && height >= 1200 ? "w-64 h-64" : width >= 800 && height >= 570 ? "w-38 h-38" : width >= 768 ? "w-42 h-42" : width >= 640 ? "w-48 h-48" : width >= 400 ? "w-40 h-40" : width >= 300 && height > 580 ? "w-32 h-32" : "w-28 h-28" 
          : "w-32 h-32 sm:w-48 sm:h-48 md:w-52 md:h-52  xl:h-56 xl:w-56"}`}
        draggable={false}
      />
    </div>
  );
}

// Main game component with integrated animation logic
export default function BlindBoxGame(): JSX.Element {
  const {
    prizes,
    gamePhase,
    gameStart,
    selectedBoxIndex,
    currentPrize,
    isAnimating,
    selectBox,
    handleStartGame,
    setAnimating,
    PRIZE_DETAILS,
    dimensions,
  } = useBlindBox();

  const gameSession = useGameStore((s) => s.gameSession);
  const widgetSettings = useGameStore((s) => s.widgetSettings);
  const remainingCredit = useGameStore((s) => s.remainingCredit);

  //* State for instruction modal
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Refs for animations
  const boxRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const prizeRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle animations when box is selected
  useEffect(() => {
    if (gamePhase === "boxSelected" && selectedBoxIndex >= 0) {
      // Check if all refs are assigned
      if (
        boxRefs.current[selectedBoxIndex] &&
        boxRefs.current.every((ref, i) => i === selectedBoxIndex || ref)
      ) {
        animateBoxSelection();
      } else {
        console.warn(
          "Box refs not fully assigned:",
          boxRefs.current.map((ref) => (ref ? "Assigned" : "Null")),
        );
        // Optionally delay animation until refs are ready
        const checkRefs = setInterval(() => {
          if (
            boxRefs.current[selectedBoxIndex] &&
            boxRefs.current.every((ref, i) => i === selectedBoxIndex || ref)
          ) {
            clearInterval(checkRefs);
            animateBoxSelection();
          }
        }, 100);
        return () => clearInterval(checkRefs);
      }
    }
  }, [gamePhase, selectedBoxIndex]);

  // Reset animations when starting new game
  useEffect(() => {
    if (gamePhase === "initial") {
      resetAnimations();
    }
  }, [gamePhase]);

  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );
    };
    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  // Animation sequence for box selection and prize reveal
  const animateBoxSelection = (): void => {
    const { height } = dimensions;
    const selectedBox = boxRefs.current[selectedBoxIndex];
    const otherBoxes = boxRefs.current.filter(
      (_, index) => index !== selectedBoxIndex,
    );

    if (!selectedBox) {
      console.error("Selected box ref not found");
      return;
    }

    setAnimating(true);

    const tl = gsap.timeline();

    // Step 1: Move selected box up to reveal prize
    tl.to(selectedBox, {
      y: -100,
      duration: 0.8,
      ease: "power2.out",
    });

    // Step 2: Show prize with fade-in effect if prizeRef exists
    if (prizeRef.current) {
      tl.to(
        prizeRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      );
    }

    // Step 3: Zoom in selected box and center it on the screen
    tl.to(
      selectedBox,
      {
        scale: 1.3,
        duration: 1,
        ease: "power2.inOut",
        position: "absolute",
        left: "50%",
        top: height > 800 ? "45%" : height > 600 ? "35%" : "45%",
        xPercent: -50,
        yPercent: -50,
        delay: 1,
      },
      "-=0.3",
    )
      // Step 4: Fade out other boxes
      .to(
        otherBoxes.filter((box) => box),
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.8",
      )
      // Step 5: Ensure animation completes
      .call(() => {
        setAnimating(false);
      });
  };

  // Reset all animations to initial state
  const resetAnimations = (): void => {
    boxRefs.current.forEach((box) => {
      if (box) {
        gsap.set(box, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          position: "relative",
          left: "auto",
          top: "auto",
          xPercent: 0,
          yPercent: 0,
          clearProps: "all",
        });
      }
    });

    // Reset box container
    if (boxContainerRef.current) {
      gsap.set(boxContainerRef.current, {
        x: 0,
        clearProps: "all",
      });
    }

    // Reset prize display
    if (prizeRef.current) {
      gsap.set(prizeRef.current, {
        opacity: 0,
        scale: 0.8,
      });
    }
  };

  // Handle box click
  const handleBoxClick = async (boxIndex: number): Promise<void> => {
    if (gamePhase === "initial" && !isAnimating) {
      await selectBox(boxIndex);
    }
  };

  //* Handle mouse enter for button animations
  const handleButtonMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  //* Handle mouse leave for button animations
  const handleButtonMouseLeave = (
    e: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const InstructionModal = () => (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-100">
      <div className="bg-white text-black p-10 rounded-4xl max-w-lg w-full flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold">Prizes You Can Win</p>
          <XIcon
            className="cursor-pointer"
            onClick={() => setShowInstructions(false)}
          />
        </div>

        {/* Prize list */}
        <div className="flex flex-col gap-4 pr-2">
          {prizes.map((prize, index) => {
            if (prize.type === 4) return null;

            return (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={
                    (prize.imageFile?.url as string) ??
                    "/game_assets/blind_box/mystery_box.png"
                  }
                  alt={prize.name}
                  className="w-20 h-20 object-contain"
                />
                <p className="text-xl">{prize.name}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom text */}
        <div className="flex flex-col gap-3">
          <span className="text-lg font-bold">
            The more you shop, the more chances you get to win!
          </span>
          <span className="text-lg">
            For every <strong>${widgetSettings?.creditPerAmount} spent</strong>,
            you’ll earn <strong>1 Game Credit</strong>. Use your Game Credits to
            unlock exciting games and stand a chance to win exclusive prizes
            with every play.
          </span>
        </div>
      </div>
    </div>
  );

  const PrizeDisplay = ({ prize }: { prize: IPrize }) => {
    const description = PRIZE_DETAILS[prize.id]?.description;
    const descriptionLength = description ? description.length : 0;
    const { height, width} = dimensions;
    return (
      <div
        className={`w-full z-50 absolute left-1/2 transform -translate-x-1/2 text-center space-y-6 px-4 lg:px-28 xl:px-65 
          ${descriptionLength > 50 
            ? height > 1200 && width > 2500 ? "bottom-48" : height > 1000 ? "bottom-28" : height > 800 && width > 440 ? "bottom-24" : height > 800 ? "bottom-14" : height > 650 ? "bottom-6" : height > 590 && width > 380 ? "bottom-10" : height > 570 && width > 380 ? "bottom-6" : "bottom-1"
            : height > 1200 ? "bottom-34" : height > 700 ? "bottom-20" : height > 590 ? "bottom-28" : "bottom-18"}`
          }
      >
        {/* Prize Title */}
        <h2
          className={`font-black! drop-shadow-2xl! animate-pulse 
            ${descriptionLength > 50 
              ? height > 1200 && width > 1400 ? "text-5xl!" : height > 1000 && width > 800 ? "text-4xl!" : height > 800 && width > 440 ? "text-3xl!" : height > 590 ? "text-2xl!" : height > 550 && width > 300 ? "text-lg" : "text-2xl"
              : height > 1000 && width >= 800 ? "text-5xl" : width > 760 ? "text-3xl" : height > 590 ? "text-2xl" : "text-xl"} 
            `}
        >
          <span className="bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-500 bg-clip-text text-transparent">
            {description}
          </span>
        </h2>

        {/* Action Button */}
        {(remainingCredit ? remainingCredit - 1 : 0) >= 1 && (
          <div className={`flex flex-col md:flex-row items-center justify-center gap-4 z-50
            ${width > 2500 || height > 1000 ? "mt-16" : width > 1400 ? "mt-12" : height > 570 && width > 330 ? "mt-6" : "-mt-2"}
          `}>
            <button
              onClick={handleStartGame}
              disabled={
                remainingCredit === 0 || gameSession.status === "loading"
              }
              onMouseEnter={handleButtonMouseEnter}
              onMouseLeave={handleButtonMouseLeave}
              className={`flex items-center justify-center bg-yellow-600! hover:bg-yellow-500! 
              text-white font-bold text-center rounded-xl border border-yellow-300!              
              shadow-lg cursor-pointer transition-all duration-200 min-w-[230px]
              ${width > 2500 ? "h-20 text-3xl!" : height > 1200 ? "h-16 text-2xl!" : height > 570 && width > 380 ? "h-14 text-lg!" : "h-10 text-sm"} px-8
              `}
            >
              {gameSession.status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Starting...
                </span>
              ) : (
                <>Play Again</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col relative game-container overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
      style={{
        backgroundImage: 'url("/game_assets/blind_box/blind_bg.webp")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay",
        height: "calc(var(--vh) * 100)",
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />

      <GameCheckpoint
        game={{
          name: "Treasure Box Game",
          detail: `Click on the treasure box to open it and win amazing prizes. You have ${remainingCredit} game ${(remainingCredit ?? 0) > 1 ? "credits" : "credit"}`,
          status: gameStart ? "started" : "idle",
          onStart: handleStartGame,
        }}
      />

      {showInstructions && <InstructionModal />}

      {/* Game content */}
      <div className="relative z-10 flex flex-col h-full ">
        {/* Header Instructions */}
        <div className="flex-shrink-0 text-center py-4">
          <div className="inline-block mx-auto px-6 py-3 rounded-lg">
            <h1 className="text-2xl! md:text-4xl! font-bold text-white mb-2">
              Treasure Box Game
            </h1>

            {(gamePhase === "initial" ||
              gamePhase === "prizeRevealed" ||
              gamePhase === "boxSelected") && (
              <p className="text-lg text-white">
                {getGameHeader(
                  gamePhase === "boxSelected" || gamePhase === "prizeRevealed"
                    ? remainingCredit
                      ? remainingCredit - 1
                      : 0
                    : remainingCredit
                      ? remainingCredit
                      : 0,
                )}
              </p>
            )}
          </div>
        </div>

        <div className="relative flex-1 min-h-0 flex flex-col w-full items-center justify-center">
          {/* Game Prize Instructions */}
          {widgetSettings && widgetSettings.iconDisplay && (
            <BlindBoxIcon
              top={widgetSettings?.verticalPosVal}
              offset={widgetSettings?.horizontalPosVal}
              side={widgetSettings.position}
              bgColor={widgetSettings.iconBg}
              iconColor={widgetSettings.iconColor}
              onClick={() => setShowInstructions(!showInstructions)}
            />
          )}

          {/* Main Game Area */}
          <div className="w-full flex-1 flex items-center justify-center px-4 relative">
            {/* Prize Display - Positioned behind the boxes, shown during animation */}
            {currentPrize &&
              (gamePhase === "boxSelected" ||
                gamePhase === "prizeRevealed") && (
                <div
                  ref={prizeRef}
                  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          opacity-0 scale-75 z-5 p-4 rounded-lg border-2 shadow-lg pointer-events-none"
                  style={{
                    marginTop: "80px", // Position it below where the box will lift
                  }}
                >
                  {currentPrize && (
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {PRIZE_DETAILS[currentPrize.id]?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {PRIZE_DETAILS[currentPrize.id]?.description}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Treasure Boxes Container */}
            <div
              ref={boxContainerRef}
              className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
            >
              {[0, 1, 2].map((index) => (
                <TreasureBox
                  key={index}
                  index={index}
                  isSelected={selectedBoxIndex === index}
                  onClick={handleBoxClick}
                  disabled={
                    isAnimating ||
                    (gamePhase !== "initial" && gamePhase !== "prizeRevealed")
                  }
                  boxRef={(el) => (boxRefs.current[index] = el)}
                  dimensions={dimensions}
                />
              ))}
            </div>

            {/* Prize Results - Shown after animation completes */}
            {gamePhase === "prizeRevealed" && currentPrize && (
              <PrizeDisplay prize={currentPrize} />
            )}
          </div>

          <footer className="w-full py-4 flex justify-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-white text-xs md:text-base font-normal">
                Powered by
              </span>
              <img
                src="/logos/logo-white.png"
                alt="ShopXR Logo"
                className="h-4 md:h-6 object-contain"
              />
            </div>
          </footer>
        </div>
        {/* Loading indicator during animations */}
        {(gameSession.status === "loading" || isAnimating) &&
          gamePhase !== "prizeRevealed" && gameStart && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-60">
              <Loader />
            </div>
          )}
      </div>
    </div>
  );
}
