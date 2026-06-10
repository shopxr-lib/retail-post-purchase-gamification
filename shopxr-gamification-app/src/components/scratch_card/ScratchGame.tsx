import React, { useEffect, useState } from "react";
import { useScratchGame } from "./ScratchGameContext";
import { XIcon } from "lucide-react";
import ScratchCard from "./ScratchCard";
import ScratchPrizeReveal from "./ScratchPrizeReveal";
import { GameCheckpoint, ScratchCardIcon } from "../../components";
import { useGameStore } from "../../stores/useGameStore";
import { getGameHeader } from "../../utils";
import { ScratchCardLoader } from "./ScratchCardLoader";

const ScratchGame: React.FC = () => {
  const { gameState, isScratchedEnough, startNewGame, prizes } =
    useScratchGame();

  const widgetSettings = useGameStore((s) => s.widgetSettings);
  const gameSession = useGameStore((s) => s.gameSession);
  const remainingCredit = useGameStore((s) => s.remainingCredit);

  //* State for instruction modal
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

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

  const InstructionModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[300]">
      <div className="bg-[#232323] text-white p-10 rounded-2xl md:rounded-4xl max-w-lg w-full flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center sticky mb-3">
          <p className="text-2xl font-bold">Prizes You Can Win</p>
          <XIcon
            className="text-lg md:text-xl cursor-pointer"
            onClick={() => setShowInstructions(false)}
          />
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 flex-1 custom-scrollbar
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-500
          [&::-webkit-scrollbar-thumb]:rounded-full"
        >

          {/* Prize list */}
          <div className="flex flex-col gap-4 pr-2">
            {prizes.map((prize, index) => {
              if (prize.type === 4) return null;

              return (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={
                      (prize.imageFile?.url as string) ??
                      "/game_assets/scratch/gift_box3.png"
                    }
                    alt={prize.name}
                    className="w-15 h-15 md:w-16 md:h-16 object-contain"
                  />
                  <p className="text-xl">{prize.name}</p>
                </div>
              );
            })}
          </div>

          {/* Bottom text */}
          <div className="flex flex-col gap-3 text-left">
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
    </div>
  );

  return (
    <div
      className="relative flex flex-col"
      style={{
        background:
          isScratchedEnough || gameState == "revealed"
            ? "rgba(0,0,0,0.5)"
            : "transparent",
        borderRadius: "0.5rem",
        height: "calc(var(--vh) * 100)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/game_assets/scratch/scratch_bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
          zIndex: "-1",
        }}
      />

      {/* Header */}
      <div className="w-full text-center mb-8 px-5 pt-8 rounded-lg">
        <h1 className="text-4xl! font-bold! text-gray-100 mb-2! flex items-center justify-center gap-3">
          Scratch & Win
        </h1>
        <p className="text-gray-100 text-lg! font-medium! shadow-2xl">
          {getGameHeader(
            gameState === "revealed"
              ? remainingCredit
                ? remainingCredit - 1
                : 0
              : remainingCredit
                ? remainingCredit
                : 0,
          )}
        </p>
      </div>

      {gameSession.status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ScratchCardLoader />
        </div>
      )}

      {/* Game Area */}
      <div
        className="relative flex-1 min-h-0 flex flex-col w-full items-center justify-start"
        style={{ overflow: "visible", minHeight: 0 }}
      >
        <div
          className={`max-w-2xl mx-auto px-4 md:px-0 h-full ${gameState === "revealed" ? "z-[200]" : ""}`}
        >
          {gameState === "scratching" && gameSession.status !== "loading" ? (
            <div className="flex justify-center h-full items-center">
              <div
                className="
                  relative
                  w-[90vw]
                  h-[360px] md:h-[400px]
                  rounded-xl
                  bg-center bg-contain bg-no-repeat
                  flex flex-col items-center justify-center text-center
                  p-4 sm:p-6
                  mb-20
                "
                style={{
                  backgroundImage:
                    "url('/game_assets/scratch/scratch_card.png')",
                }}
              >
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <span
                    className="
                        font-bold
                        pb-2
                        text-xl sm:text-2xl md:text-2xl
                        bg-gradient-to-r
                        from-[#FF0BFF]
                        via-[#8725FF]
                        to-[#69FFFF]
                        bg-clip-text
                        text-transparent
                      "
                  >
                    Scratch & Win!
                  </span>

                  <ScratchCard />
                </div>
              </div>
            </div>
          ) : gameState === "revealed" ? (
            <ScratchPrizeReveal />
          ) : null}
        </div>

        {/* Game Prize Instructions */}
        {widgetSettings && widgetSettings.iconDisplay && (
          <ScratchCardIcon
            top={widgetSettings?.verticalPosVal}
            offset={widgetSettings?.horizontalPosVal}
            side={widgetSettings.position}
            bgColor={widgetSettings.iconBg}
            iconColor={widgetSettings.iconColor}
            onClick={() => setShowInstructions(!showInstructions)}
            disabled={
              gameState === "revealed" ||
              gameState === "ready" ||
              gameState === "gameover"
            }
          />
        )}

        {showInstructions && <InstructionModal />}

        {(gameState === "ready" || gameState === "gameover") && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-[200]">
            <GameCheckpoint
              startModal={{
                visible: gameState === "ready" || gameSession.status === "idle",
                render: (
                  <div className="space-y-6">
                    <div
                      className="rounded-xl p-8 shadow-lg text-center"
                      style={{
                        background:
                          "linear-gradient(#232323, #232323) padding-box, linear-gradient(180deg, #FF0BFF 0%, #6859FF 47.12%, #6EFFFF 100%) border-box",
                        border: "2px solid transparent",
                      }}
                    >
                      <img
                        src="/game_assets/scratch/gift_box2.webp"
                        alt="Gift Box"
                        className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-4 object-contain"
                      />
                      <h2 className="text-2xl! font-bold! text-white mb-4!">
                        Ready to Play?
                      </h2>
                      <p className="text-gray-100 mb-6!">
                        Click the button below to get your scratch card!
                      </p>
                      <button
                        onClick={startNewGame}
                        disabled={
                          remainingCredit === 0 ||
                          gameSession.status === "loading"
                        }
                        className="w-full md:w-auto text-white py-2! px-20! rounded-4xl!
                          font-semibold! transition-transform hover:scale-105 active:scale-95 
                          disabled:bg-gray-600 disabled:cursor-not-allowed cursor-pointer shadow-md"
                        style={{
                          backgroundImage:
                            "linear-gradient(111.55deg, #FF0BFF 8.04%, #6853FF 50.47%, #6EFFFF 88.27%)",
                        }}
                      >
                        {gameSession.status === "loading" ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Starting...
                          </span>
                        ) : (
                          <>Get Scratch Card</>
                        )}
                      </button>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="absolute bottom-3 w-full py-4 flex justify-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-white text-sm font-normal">Powered by</span>
          <img
            src="/logos/logo-white.png"
            alt="ShopXR Logo"
            className="h-[20px] object-contain"
          />
        </div>
      </footer>
    </div>
  );
};

export default ScratchGame;
