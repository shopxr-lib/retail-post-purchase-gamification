import React, { useEffect, useRef, useState } from "react";
import { useGameContext } from "./GameContext";
import { useTreasureLogic } from "./TreasureBoxLogic";
import { gsap } from "gsap";
import { useGameStore } from "../../stores/useGameStore";
import { GameCheckpoint, TreasureBoxIcon, Loader } from "../../components";
import { XIcon } from "lucide-react";
import { getGameHeader } from "../../utils";
import type { IPrize } from "../../types";

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

//* Handle box hover animations
const handleBoxMouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
  gsap.to(e.currentTarget, {
    scale: 1.2,
    // rotation: 2,
    duration: 0.3,
    ease: "power2.out",
  });
};

const handleBoxMouseLeave = (e: React.MouseEvent<HTMLDivElement>): void => {
  gsap.to(e.currentTarget, {
    scale: 1,
    rotation: 0,
    duration: 0.3,
    ease: "power2.out",
  });
};

const TreasureBoxGame = () => {
  const prizes = useGameStore((s) => s.prizes);
  const gameSession = useGameStore((s) => s.gameSession);
  const remainingCredit = useGameStore((s) => s.remainingCredit);
  const currentPrize = useGameStore((s) => s.currentPrize);

  const startGameSession = useGameStore((s) => s.startGameSession);
  const addPrizeWon = useGameStore((s) => s.addPrizeWon);
  const widgetSettings = useGameStore((s) => s.widgetSettings);

  const { state, dispatch, dimensions } = useGameContext();
  const { getPrizeInfo } = useTreasureLogic();

  //* Refs for GSAP animations
  const boxesContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedBoxRef = useRef<HTMLDivElement | null>(null);
  const prizeResultRef = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  //* State for instruction modal
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  //* GSAP Animation Effects
  useEffect(() => {
    if (state.gamePhase === "initial" && boxesContainerRef.current) {
      // Animate boxes appearing when game starts/restarts
      const boxes = boxesContainerRef.current.querySelectorAll(".treasure-box");
      gsap.fromTo(
        boxes,
        {
          scale: 0,
          rotation: 180,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
      );
    }
  }, [state.gamePhase]);

  useEffect(() => {
    if (state.gamePhase === "boxSelected") {
      // Hide other boxes first
      const boxes =
        boxesContainerRef.current?.querySelectorAll(".treasure-box");
      if (boxes) {
        gsap.to(boxes, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }

      // Animate selected box appearing magically from scale 0
      if (selectedBoxRef.current) {
        gsap.fromTo(
          selectedBoxRef.current,
          {
            scale: 0,
            rotation: 360,
            opacity: 0,
            y: -100,
          },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.3)",
            delay: 0.4,
          },
        );
      }

      // Animate prize result text
      if (prizeResultRef.current) {
        gsap.fromTo(
          prizeResultRef.current,
          {
            scale: 0,
            opacity: 0,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 1.0,
          },
        );
      }

      // Animate buttons
      if (buttonsRef.current) {
        gsap.fromTo(
          buttonsRef.current,
          {
            scale: 0,
            opacity: 0,
            y: 30,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            delay: 1.4,
          },
        );
      }
    }
  }, [state.gamePhase, state.selectedBox]);

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

  //* Handle box click - generates random prize and updates state
  const handleBoxClick = async (boxIndex: number): Promise<void> => {
    if (state.gamePhase !== "initial") return;

    const prize = currentPrize as IPrize;

    // Add click animation before state change
    const clickedBox = boxesContainerRef.current?.children[
      boxIndex
    ] as HTMLElement;
    if (clickedBox) {
      gsap.to(clickedBox, {
        scale: 1.2,
        duration: 0.1,

        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          addPrizeWon(prize.id).then((result) => {
            if (!result.success) {
              dispatch({ type: "RESET_GAME" });
            } else {
              dispatch({ type: "SELECT_BOX", boxIndex, result: result.prize! });
            }
          });
        },
      });
    } else {
      addPrizeWon(prize.id).then((result) => {
        if (!result.success) {
          dispatch({ type: "RESET_GAME" });
        } else {
          dispatch({ type: "SELECT_BOX", boxIndex, result: result.prize! });
        }
      });
    }
  };

  //* Handle start game - initializes game session and updates state
  const handleStartGame = async () => {
    await startGameSession();
    dispatch({ type: "START_GAME" });
  };

  const InstructionModal = () => (
    <div className="fixed inset-0 bg-white/40 flex items-center justify-center p-4 z-10">
      <div className="bg-[#101010] text-white p-10 rounded-4xl max-w-lg w-full flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
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
            const { text, imageUrl } = getPrizeInfo(prize);
            if (prize.type === 4) return null;

            return (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt={text}
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

  const PrizeDisplay = () => {
    const { width, height } = dimensions;

    return (
      <div className="flex flex-col items-center justify-center px-4">
        <div ref={selectedBoxRef} className="mb-2">
          {state.selectedBox !== null && state.boxResults[state.selectedBox] && (
            <img
              src="/game_assets/treasure_box/box_prize1.webp"
              alt={getPrizeInfo(state.boxResults[state.selectedBox]!).text}
              className={`object-contain drop-shadow-2xl
                ${width < 768 || height < 600 ? 'w-40 h-40' : 'w-64 h-64'} 
              `}
            />
          )}
        </div>

        {/* Prize Result Display */}
        <div ref={prizeResultRef} className="text-center mt-8 mb-4 space-y-6">
          {state.selectedBox !== null && state.boxResults[state.selectedBox] && (
            <div className="flex flex-col gap-6">
              <div className="relative">
                <h2 className={`font-black mb-3 drop-shadow-2xl animate-pulse
                    ${width < 550 || height < 600 ? "text-xl" : width < 768 ? 'text-2xl' : width < 850 ? "text-3xl" : 'text-4xl'} 
                  `}>
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 bg-clip-text text-transparent">
                    {getPrizeInfo(state.boxResults[state.selectedBox]!).text}
                  </span>
                </h2>
              </div>
            </div>
          )}
        </div>

        {(remainingCredit ? remainingCredit - 1 : 0) >= 1 && (
          <div
            ref={buttonsRef}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            {/* Action Button */}
            <button
              onClick={handleStartGame}
              disabled={remainingCredit == 0 || gameSession.status === "loading"}
              onMouseEnter={handleButtonMouseEnter}
              onMouseLeave={handleButtonMouseLeave}
              className={`flex items-center justify-center bg-yellow-600! hover:bg-yellow-500!
              text-white font-bold text-center rounded-xl border border-yellow-300
              shadow-lg transition-all duration-200 cursor-pointer
              ${width < 640 
                ? `h-12 px-6 text-base min-w-[180px]` 
                : width < 768 
                  ? 'h-12 px-8 text-lg min-w-[200px]' 
                  : 'h-12 px-10 text-xl min-w-[230px]'}
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
    )
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: "url(/game_assets/treasure_box/box_bg.webp)",
        height: "calc(var(--vh) * 100)",
      }}
    >
      <GameCheckpoint
        game={{
          name: "Treasure Box Game",
          detail: `Click on the treasure box to open it and win amazing prizes. You have ${remainingCredit} game ${(remainingCredit ?? 0) > 1 ? "credits" : "credit"}.`,
          status: state.gameStart ? "started" : "idle",
          onStart: handleStartGame,
        }}
      />

      {/* Game Instructions */}
      <div className="text-center mb-8 px-5 py-2 rounded-lg">
        <h1 className="text-2xl! md:text-4xl! font-bold! text-white mb-4! drop-shadow-lg!">
          Treasure Box Game
        </h1>
        <p className="text-lg! md:text-xl! text-white drop-shadow-md!">
          {getGameHeader(
            state.gamePhase === "boxSelected"
              ? remainingCredit
                ? remainingCredit - 1
                : 0
              : remainingCredit
                ? remainingCredit
                : 0,
          )}
        </p>
      </div>

      {/* Game Prize Info Modal */}
      {showInstructions && <InstructionModal />}

      {gameSession.status === "loading" && state.gamePhase !== "boxSelected" && (
        <div className="fixed inset-0 flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="relative flex-1 min-h-0 flex flex-col w-full items-center justify-center">
        {/* Game Prize Instructions */}
        {widgetSettings && widgetSettings.iconDisplay && (
          <TreasureBoxIcon
            top={widgetSettings?.verticalPosVal}
            offset={widgetSettings?.horizontalPosVal}
            side={widgetSettings.position}
            bgColor={widgetSettings.iconBg}
            iconColor={widgetSettings.iconColor}
            onClick={() => setShowInstructions(!showInstructions)}
          />
        )}

        {/* Game Area */}
        {
          <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
            {state.gamePhase === "initial" &&
            gameSession.status !== "loading" ? (
              // Initial state: Show 3 boxes
              <div
                ref={boxesContainerRef}
                className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center"
              >
                {[0, 1, 2].map((boxIndex) => (
                  <div
                    key={boxIndex}
                    className="treasure-box cursor-pointer"
                    onClick={() => handleBoxClick(boxIndex)}
                    onMouseEnter={handleBoxMouseEnter}
                    onMouseLeave={handleBoxMouseLeave}
                  >
                    <img
                      src="/game_assets/treasure_box/box_closed.webp"
                      alt={`Treasure Box ${boxIndex + 1}`}
                      className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
                    />
                  </div>
                ))}
              </div>
            ) : state.gamePhase === "boxSelected" && <PrizeDisplay />
            }
          </div>
        }

        {/* Footer */}
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
    </div>
  );
};

export default TreasureBoxGame;
