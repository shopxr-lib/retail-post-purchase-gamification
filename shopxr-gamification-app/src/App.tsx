import "./App.css";
import { useEffect } from "react";
import { useGameStore } from "@src/stores/useGameStore";
import { GameLoader, ScratchGame, TreasureBoxGame } from "@src/components";
import { Box3DProvider } from "./components/3d_box/Box3DContext";
import BoxMainGame from "./components/3d_box/BoxMainGame";
import { BlindBoxProvider } from "./components/blind_box/BlindBoxContext";
import BlindBoxGame from "./components/blind_box/BlindBoxGame";
import { ScratchGameProvider } from "./components/scratch_card/ScratchGameContext";
import { GameProvider } from "./components/treasure_box/GameContext";
import { Trophy, Sparkles, Shield, ArrowUpRight } from "lucide-react";
import { GachaponProvider } from "./components/gachapon/GachaponContext";
import GachaponLogic from "./components/gachapon/GachaponLogic";
import GachaponGame from "./components/gachapon/GachaponGame";

function App() {
  const gameData = useGameStore((s) => s.gameData);
  const gameType = useGameStore((state) => state.selectedGame);
  const fetchGameData = useGameStore((s) => s.fetchGameData);

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );
    };
    if (gameData.error) {
      setVH();
      window.addEventListener("resize", setVH);
      return () => window.removeEventListener("resize", setVH);
    }
  }, [gameData.error]);

  if (gameData.loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
        <GameLoader />
      </div>
    );
  }

  const features = [
    {
      icon: Trophy,
      title: "Reward loyalty",
      description:
        "Give customers points, badges, and milestones after every purchase.",
    },
    {
      icon: Sparkles,
      title: "Drive repeat visits",
      description:
        "Treasure boxes and challenges bring customers back to your store.",
    },
    {
      icon: Shield,
      title: "No dev work needed",
      description:
        "Installs directly into your Shopify theme in minutes, no code required.",
    },
  ];

  if (gameData.error) {
    return (
      <div
        className="bg-white flex flex-col items-center justify-center min-h-screen px-6"
        style={{ height: "calc(var(--vh) * 100)" }}
      >
        <div className="max-w-md w-full text-center">
          <h1 className="mx-auto mb-6">🎮</h1>

          <p className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
            ShopXR Post Purchase Gamification
          </p>

          <p className="text-sm md:text-lg text-gray-600 mb-6">
            Add post-purchase gamification to your Shopify store to boost repeat
            purchases and increase customer lifetime value.
          </p>

          <div className="flex flex-col gap-2.5 mb-8 text-left">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-lg"
              >
                <Icon className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-0.5">
                    {title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://gamification.shopxr.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white! text-sm font-medium rounded-lg hover:bg-gray-700 transition"
          >
            Learn more <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  switch (gameType) {
    case 1:
      return (
        <GameProvider>
          <TreasureBoxGame />
        </GameProvider>
      );
    case 2:
      return (
        <BlindBoxProvider>
          <BlindBoxGame />
        </BlindBoxProvider>
      );
    case 3:
      return (
        <div
          className="w-full h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
          style={{
            backgroundImage: "url('/game_assets/3d_Box/dead-forest.webp')",
            backgroundSize: "cover",
          }}
        >
          <Box3DProvider>
            <BoxMainGame />
          </Box3DProvider>
        </div>
      );
    case 4:
      return (
        <ScratchGameProvider>
          <ScratchGame />
        </ScratchGameProvider>
      );
    case 5: {
      return (
        <GachaponProvider>
          <GachaponLogic>
            <GachaponGame />
          </GachaponLogic>
        </GachaponProvider>
      )
    }
    default:
      return null;
  }
}

export default App;
