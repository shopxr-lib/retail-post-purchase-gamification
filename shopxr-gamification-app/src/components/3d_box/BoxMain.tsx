import { type FC } from "react";
import { Box3DProvider } from "./Box3DContext";
import BoxMainGame from "./BoxMainGame";

const BoxMain: FC = () => {
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
};

export default BoxMain;
