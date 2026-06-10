import { useEffect, useState } from "react";
import { useGacha } from "./GachaponContext";
import { useGameStore } from "../../stores/useGameStore";
import { getGameHeader } from "../../utils";
import { GameCheckpoint, Loader } from "..";
import { XIcon } from "lucide-react";
import GachaponIcon from "./GachaponIcon";

const GachaponGame = () => {
  const {
    currentPrize,
    PRIZE_DETAILS,
    gameState,
    isMobile,
    currentHeight,
    spin,
    startGame,
  } = useGacha();

  const prizes = useGameStore((s) => s.prizes);
  const gameSession = useGameStore((s) => s.gameSession);
  const widgetSettings = useGameStore((s) => s.widgetSettings);
  const remainingCredit = useGameStore((s) => s.remainingCredit);

  //* State for instruction modal
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const assetPath = "/game_assets/gachapon/";

  useEffect(() => {
    const bodyStyle = {
      overflow: document.body.style.overflow,
      height: document.body.style.height,
      touchAction: document.body.style.touchAction,
    };
    const htmlStyle = {
      overflow: document.documentElement.style.overflow,
      height: document.documentElement.style.height,
    };

    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100dvh";

    return () => {
      document.body.style.overflow = bodyStyle.overflow;
      document.body.style.height = bodyStyle.height;
      document.body.style.touchAction = bodyStyle.touchAction;
      document.documentElement.style.overflow = htmlStyle.overflow;
      document.documentElement.style.height = htmlStyle.height;
    };
  }, []);

  const InstructionModal = () => (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-100">
      <div className="bg-white text-black p-10 rounded-4xl max-w-lg w-full flex flex-col gap-3 max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center sticky mb-3">
          <p className="text-2xl font-bold">Prizes You Can Win</p>
          <XIcon
            className="cursor-pointer"
            onClick={() => setShowInstructions(false)}
          />
        </div>

        <div className="overflow-y-auto px-2 mx-2 
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">

          {/* Prize list */}
          <div className="flex flex-col gap-4 pr-2">
            {prizes.map((prize, index) => {
              if (prize.type === 4) return null;

              return (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={
                      (prize.imageFile?.url as string) ??
                      `${assetPath}ball_purple.webp`
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
          <div className="flex flex-col gap-3 pt-3">
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

  const isSmallScreen = isMobile || currentHeight < 670;
  const isExtraSmallScreen = currentHeight < 570 || (isMobile && currentHeight < 670);

  return (
    <div
      className="relative w-screen h-[100dvh] overflow-hidden overscroll-none flex flex-col items-center font-pixel"
      style={{
        backgroundImage: isSmallScreen ? "url('/game_assets/gachapon/gachapon_mobile _bg.webp')" : "url('/game_assets/gachapon/gachapon_desktop_bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <GameCheckpoint
        game={{
          name: "Spin & Win",
          detail: `Spin the level and win amazing prizes. You have ${remainingCredit} game ${(remainingCredit ?? 0) > 1 ? "credits" : "credit"}`,
          status: gameState === "idle" ? "idle" : "started",
          onStart: startGame,
        }}
      />

      {showInstructions && <InstructionModal />}

      {gameSession.status === "loading" && gameState === "validating" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-60">
          <Loader />
        </div>
      )}

      {/* Top UI - Header Bubble */}
      <div className="relative mt-8 z-10 w-[100%] max-w-[600px] h-32 flex items-center justify-center">
        <img
          src={`${assetPath}bubble_top.webp`}
          className="absolute inset-[-15px] w-full h-full"
          alt="UI"
        />
        <div className="relative text-center mb-8 pl-4 text-black leading-tight select-none">
          <p className="text-2xl md:text-3xl font-bold tracking-wide">
            Spin & Win
          </p>
          <p
            className={`${isSmallScreen ? "text-[14px] mt-1 text-wrap pr-20 sm:pr-12 md:pr-4 pl-14 sm:pl-6 md:pl-6" : "text-md mt-1 pr-14 pl-14"}`}
          >
            {getGameHeader(
              gameState === "reward"
                ? remainingCredit
                  ? remainingCredit - 1
                  : 0
                : remainingCredit
                  ? remainingCredit
                  : 0,
            )}
          </p>
        </div>
      </div>

      {/* Main Machine Area */}
      <div
        className={`relative flex-1 w-full flex flex-col items-center justify-center transition-transform duration-500`}
      >
        {/* Game Prize Instructions */}
        {widgetSettings && widgetSettings.iconDisplay && (
          <GachaponIcon
            top={widgetSettings?.verticalPosVal}
            offset={widgetSettings?.horizontalPosVal}
            side={widgetSettings.position}
            bgColor={widgetSettings.iconBg}
            iconColor={widgetSettings.iconColor}
            onClick={() => setShowInstructions(!showInstructions)}
          />
        )}

        {/* The Machine */}
        <div className="relative z-20">
          <img
            src={`${assetPath}gachapon_machine.webp`}
            className={`drop-shadow-2xl rounded-t-full ${isExtraSmallScreen
              ? "w-[240px] scale-90" 
              : isSmallScreen 
                ? "w-[280px] scale-100" 
                : "w-[300px] scale-110"}`}
            alt="Machine"
          />

          {/* MACHINE OVAL SHADOW (Base) */}

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[100%] h-20 bg-[#C0A0D5] rounded-[100%] -z-10" />

          {/* Lever Area */}
          <div
            className={`absolute ${isExtraSmallScreen
              ? "right-[36.5%] bottom-[98px]" 
              : isSmallScreen 
                ? "right-[38.7%] bottom-[108px]" 
                : "right-[38.4%] bottom-[115px]"} z-20`}
          >
            {gameState === "idle" && (
              <div
                onClick={spin}
                className={`absolute bottom-full cursor-pointer ${isExtraSmallScreen
                  ? "left-14 -mb-6 w-32"
                  : isSmallScreen 
                    ? "left-13 -mb-1 w-36" 
                    : "left-20 mb-10 w-40 "}`}
              >
                <img
                  src={`${assetPath}bubble_message_lever.webp`}
                  className="w-full"
                  alt="Click"
                />
                <span className={`absolute inset-0 flex items-center justify-center  text-wrap font-bold text-black pb-3 animate-pulse 
                  ${isExtraSmallScreen ? "text-md" : "text-lg"}`}>
                  Click To Spin
                </span>
              </div>
            )}
            <img
              src={`${assetPath}lever.webp`}
              className={`cursor-pointer transition-transform duration-300 transform-gpu
                ${isSmallScreen ? "w-16" : "w-18"} 
                ${gameState !== "idle" ? "rotate-90" : "active:scale-100"}`}
              onClick={spin}
              alt="Lever"
            />
          </div>

          {/* Animated Ball Drop */}
          {gameState === "spinning" && (
            <img
              src={`${assetPath}ball_purple.webp`}
              className="absolute left-1/2 bottom-[40px] w-12 -translate-x-1/2 animate-ball-drop"
              alt="Dropping Ball"
            />
          )}
        </div>

        {/* Surface/Floor decorations from reference */}
        {
          <div
            className={`absolute bottom-0 w-full bg-[#EFD9FD] z-10 ${isSmallScreen ? "h-[280px]" : "h-[240px]"}`}
          >
            {/* Left Side Balls */}

            {/* Red Ball Top Left */}
            <div
              className={`absolute -rotate-1 ${isSmallScreen ? "-left-[3.5%] top-[-35px] w-28" : "left-[19%] top-[-80px] w-44"}`}
            >
              <div
                className={`absolute w-[80%] h-12 bg-[#C0A0D5] rounded-[100%] z-0 ${isSmallScreen ? "bottom-2 right-[-2px]" : "bottom-4 right-[-10px]"}`}
              />
              <img
                alt="red-ball"
                src={`${assetPath}ball_red.webp`}
                className="relative z-10 w-full select-none"
              />
            </div>
            {/* Purple Ball Bottom Left */}
            <div
              className={`absolute ${isSmallScreen ? "-left-[7%] bottom-[-14px] w-28 rotate-150" : "left-[2%] bottom-[-20px] w-44 rotate-180"}`}
            >
              <div
                className={`absolute  w-[80%] h-16 bg-[#C0A0D5] rounded-[100%] z-0 ${isSmallScreen ? "bottom-20 right-[30px] rotate-z-40" : "bottom-25 right-[100px]"}`}
              />
              <img
                alt="purple-ball"
                src={`${assetPath}ball_purple.webp`}
                className="relative z-10 w-full rotate-12 select-none"
              />
            </div>

            {/* Right Side Balls */}
            {/* <img
              src={`${assetPath}ball_red.webp`}
              className="absolute right-[18%] top-[-30px] rotate-y-180 -rotate-45 w-44 select-none"
              alt=""
            /> */}
            {/* Red Ball Top Right */}
            <div
              className={`absolute ${isSmallScreen ? "-right-[6%] bottom-[30px] rotate-y-180 -rotate-10 w-32" : "right-[18%] top-[-30px] rotate-y-180 -rotate-45 w-44"}`}
            >
              <div
                className={`absolute w-[80%] h-12 bg-[#C0A0D5] rounded-[100%] z-0  ${isSmallScreen ? "bottom-4 -right-[8px] -rotate-z-6" : "bottom-2 right-[8px] rotate-z-315"}`}
              />
              <img
                alt="red-ball"
                src={`${assetPath}ball_red.webp`}
                className="relative z-10 w-full select-none"
              />
            </div>

            {/* Green Ball Bottom Right */}
            {!isSmallScreen && (
              <img
                src={`${assetPath}ball_green.webp`}
                className="absolute right-[1%] bottom-[-30px] w-52 -rotate-360 select-none"
                alt="green-ball"
              />
            )}
          </div>
        }
      </div>

      {/* Award Overlay */}
      {(gameState === "opening" || gameState === "reward") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          {/* {gameState === "opening" && (
            <div className="relative flex items-center justify-center">
              <img
                src={`${assetPath}light.webp`}
                className="absolute w-[500px] animate-ping opacity-50"
              />
              <img
                src={`${assetPath}gachapon2.webp`}
                className="w-32 animate-craack-left"
              />
              <img
                src={`${assetPath}gachapon1.webp`}
                className="w-32 animate-crack-right"
              />
            </div>
          )} */}

          {gameState === "reward" && currentPrize && (
            <div className="relative w-[90%] max-w-[300px] flex flex-col items-center">
              <div className="relative z-10 flex flex-col items-center text-center gap-2 sm:gap-8 md:gap-10 lg:gap-12">
                <div className="relative flex flex-col items-center">
                  {/* Prize Text Bubble */}
                  <div
                    className="relative pt-12 pb-14 mr-6 sm:mr-8 z-20
                    pl-18 sm:pl-24 md:pl-28 lg:pl-32 
                    pr-14 sm:pr-18 md:pr-20 lg:pr-20 
                    min-w-[400px] sm:min-w-[600px] md:min-w-[700px] lg:min-w-[900px]"
                  >
                    <img
                      alt="bubble-top"
                      src={`${assetPath}bubble_top.webp`}
                      className="absolute inset-0 w-full h-full -z-10"
                    />

                    <div className="relative text-black">
                      <h2 className="text-lg font-bold">
                        {PRIZE_DETAILS[currentPrize.id].description}
                      </h2>
                    </div>
                  </div>

                  <div className="relative -mt-18 z-10">
                    {/* Light behind gachapons */}
                    <img
                      alt="light-ball"
                      src={`${assetPath}light.webp`}
                      className="w-64 opacity-70 pointer-events-none"
                    />
                    {/* Gachapons overlapping the light */}
                    <div className="flex -space-x-13 ml-6 -mt-36">
                      <img
                        alt="gachapon-2"
                        src={`${assetPath}gachapon2.webp`}
                        className="w-40 -rotate-12"
                      />
                      <img
                        alt="gachapon-1"
                        src={`${assetPath}gachapon1.webp`}
                        className="w-40 rotate-12"
                      />
                    </div>
                  </div>
                </div>

                {(remainingCredit ? remainingCredit - 1 : 0) >= 1 && (
                  <button
                    disabled={
                      remainingCredit === 0 || gameSession.status === "loading"
                    }
                    onClick={startGame}
                    className="relative group p-12 py-4 transition-transform cursor-pointer active:scale-95 bg-transparent! !outline-none focus:!outline-none hover:!outline-none focus:ring-0 border-transparent!"
                  >
                    <img
                      alt="bubble-top"
                      src={`${assetPath}bubble_top.webp`}
                      className="absolute inset-0 w-full h-full"
                    />
                    <span className="relative text-black text-lg pl-3 font-bold tracking-widest">
                      {gameSession.status === "loading"
                        ? "Starting..."
                        : "Play Again"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-3 md:pb-4 pointer-events-none">
        <p className="flex justify-center items-center gap-2 text-sm font-medium">
          Powered by{" "}
          <img className="w-20" src="/logos/logo-white.png" alt="ShopXR Logo" />
        </p>
      </div>

      {/* Custom Styles for animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ball-drop {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, 400px) scale(4); opacity: 0.8; }
        }
        @keyframes crack-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px) rotate(-20deg); opacity: 0; }
        }
        @keyframes crack-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(100px) rotate(20deg); opacity: 0; }
        }
        .animate-ball-drop { animation: ball-drop 1.5s forwards ease-in; }
        .animate-crack-left { animation: crack-left 0.8s forwards ease-out; }
        .animate-crack-right { animation: crack-right 0.8s forwards ease-out; }
      `,
        }}
      />
    </div>
  );
};

export default GachaponGame;
