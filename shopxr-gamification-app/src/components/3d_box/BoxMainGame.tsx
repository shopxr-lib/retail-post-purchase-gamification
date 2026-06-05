import React, { useEffect, useRef, useState } from "react";
import { useBox3D } from "./Box3DContext";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { XIcon } from "lucide-react";
import gsap from "gsap";
import { Group } from "three";
import { GameCheckpoint, GiftIcon, Loader } from "@src/components";
import { useGameStore } from "@src/stores/useGameStore";
import { getGameHeader } from "@src/utils";

interface GLTFResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

//* Treasure Box Model
const TreasureBox: React.FC = () => {
  const { viewport } = useThree();
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const {
    handleBoxClick,
    boxAnimationActive,
    gameStarted,
    showWinModal,
    isShaking,
    setIsShaking,
  } = useBox3D();

  const scaleFactor = viewport.width < 6 ? 0.7 : 1;

  // Loading 3d model
  const { scene, animations } = useGLTF(
    "/game_assets/3d_Box/Treasure-Box.glb",
  ) as GLTFResult;

  // Custom click handler with debugging
  const onBoxClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();

    // Only handle click if game conditions are met
    if (gameStarted && !boxAnimationActive && !isShaking) {
      handleBoxClick();
    }
  };

  // Pointer over handler
  const onPointerOver = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    if (gameStarted && !boxAnimationActive) {
      document.body.style.cursor = "pointer";
    }
  };

  // Pointer out handler
  const onPointerOut = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
  };

  // GSAP shake animation effect - very fast and hard shake on every click
  useEffect(() => {
    if (isShaking && groupRef.current) {
      // Fixed fast and hard shake intensity
      const intensity = 0.4; // High intensity for hard shaking
      const duration = 0.08; // Super fast shake duration

      // Kill any existing animations to prevent conflicts
      gsap.killTweensOf(groupRef.current.rotation);
      gsap.killTweensOf(groupRef.current.position);

      // Create very fast, hard shake animation with GSAP - rotation shake
      gsap.to(groupRef.current.rotation, {
        duration: duration,
        x: `+=${(Math.random() - 0.5) * intensity}`,
        y: `+=${(Math.random() - 0.5) * intensity}`,
        z: `+=${(Math.random() - 0.5) * intensity}`,
        ease: "power4.inOut", // Sharp, aggressive easing
        yoyo: true,
        repeat: 10, // Even more repeats for super intense shaking
        onComplete: () => {
          // Return to original rotation very quickly
          gsap.to(groupRef.current!.rotation, {
            duration: 0.05,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.out",
          });
        },
      });

      // Add position shake for more dramatic effect
      gsap.to(groupRef.current.position, {
        duration: duration,
        x: `+=${(Math.random() - 0.5) * intensity}`,
        z: `+=${(Math.random() - 0.5) * intensity}`,
        ease: "power4.inOut", // Sharp, aggressive easing
        yoyo: true,
        repeat: 10, // Even more repeats for super intense shaking
        onComplete: () => {
          // Return to original position very quickly
          gsap.to(groupRef.current!.position, {
            duration: 0.05,
            x: 0,
            y: -1.5,
            z: 0,
            ease: "power2.out",
            onComplete: () => {
              // Set isShaking to false after shake completes
              setIsShaking(false);
            },
          });
        },
      });
    }
  }, [isShaking, setIsShaking]); // Added dependencies

  // Zoom in effect when box is about to open (only when boxAnimationActive is true)
  useEffect(() => {
    if (boxAnimationActive && groupRef.current) {
      // Zoom in slightly when box opens
      gsap.to(groupRef.current.scale, {
        duration: 0.5,
        x: 1.2,
        y: 1.2,
        z: 1.2,
        ease: "power2.out",
      });

      // Zoom back out when box closes
      const timeout = setTimeout(() => {
        if (groupRef.current) {
          gsap.to(groupRef.current.scale, {
            duration: 0.5,
            x: 1,
            y: 1,
            z: 1,
            ease: "power2.out",
          });
        }
      }, 3000); // Match the box closing timeout

      return () => clearTimeout(timeout);
    }
  }, [boxAnimationActive]); // Only trigger on boxAnimationActive change

  useEffect(() => {
    if (animations && animations.length > 0 && scene) {
      // Create animation mixer
      mixerRef.current = new THREE.AnimationMixer(scene);

      // Get the animation
      const action = mixerRef.current.clipAction(animations[0]);
      actionRef.current = action;

      // Configure animation
      action.setLoop(THREE.LoopOnce, 1); // play animation only once
      action.clampWhenFinished = true; // Keep the final frame when finished
    }

    // Cleanup function
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [animations, scene]);

  // Handle Box Animations
  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Add subtle floating animation
      //   boxRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;

      // Update animation mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
    }
  });

  // Handle animation trigger when boxAnimationActive changes
  useEffect(() => {
    if (actionRef.current) {
      if (boxAnimationActive) {
        // Play the opening animation
        actionRef.current.reset();
        actionRef.current.play();
      } else {
        // Reset to closed position
        actionRef.current.stop();
        actionRef.current.reset();
      }
    }
  }, [boxAnimationActive]);

  // Make all meshes in the scene clickable
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enable raycast for all meshes
          child.raycast = THREE.Mesh.prototype.raycast;
        }
      });
    }
  }, [scene]);

  // Move box higher and scale down when prize is revealed
  useEffect(() => {
    if (!groupRef.current) return;

    if (showWinModal) {
      // When prize is revealed
      gsap.to(groupRef.current.position, {
        duration: 1,
        y: 1,
        ease: "power3.out",
      });

      gsap.to(groupRef.current.scale, {
        duration: 1,
        x: 0.85,
        y: 0.85,
        z: 0.85,
        ease: "power3.out",
      });
    } else if (gameStarted) {
      // Reset to default position when game restarts
      gsap.to(groupRef.current.position, {
        duration: 1,
        y: -0.5,
        ease: "power2.inOut",
      });

      gsap.to(groupRef.current.scale, {
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "power2.inOut",
      });
    }
  }, [showWinModal, gameStarted]);

  return (
    <group
      ref={groupRef}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      position={[0, -1.5, 0]}
      onClick={onBoxClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <primitive object={scene} />
    </group>
  );
};

//* 3D Scene to show box model
const Scene3D: React.FC = () => {
  return (
    <Canvas
      camera={{
        position: [5, 4, 15],
        fov: 50,
      }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.7} color="#ffffff" />

      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        color="#ffffff"
        castShadow
      />

      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ffd700" />

      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />

      {/* 3D Treasure Box */}
      <TreasureBox />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </Canvas>
  );
};

const PrizeDisplay: React.FC = () => {
  const { currentPrize, startGame } = useBox3D();
  const remainingCredit = useGameStore((s) => s.remainingCredit);
  const gameSession = useGameStore(s => s.gameSession);

  const description = currentPrize?.message;
  const descriptionLength = description ? description.length : 0;

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

  if (!currentPrize) return null;

  return (
    <div
      className={`absolute left-1/2 text-center space-y-2 sm:space-y-6 transform -translate-x-1/2 z-20 w-full flex flex-col items-center  
        ${descriptionLength > 50 
          ? "bottom-18 sm:bottom-40 lg:bottom-18 xl:bottom-32" 
          : "bottom-30 sm:bottom-40 lg:bottom-28 xl:bottom-36"} 
        px-4 lg:px-28 xl:px-65`}
    >
      {/* Prize Title */}
      <h2 className="text-md! sm:text-2xl! md:text-3xl! lg:text-3xl! font-black! drop-shadow-2xl! animate-pulse mb-12!">
        <span className="bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 bg-clip-text text-transparent">
          {currentPrize?.message}
        </span>
      </h2>

      {/* Action Button */}
      {(remainingCredit ? remainingCredit - 1 : 0) >= 1 && (
        <button
          onClick={startGame}
          disabled={
            remainingCredit === 0 ||
            gameSession.status === "loading"
          }
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          className="flex items-center justify-center  h-10 sm:h-14 px-6 sm:px-8 
          bg-yellow-600! hover:bg-yellow-500! 
          text-white text-md sm:text-lg md:text-xl font-bold 
          rounded-xl border border-yellow-300! shadow-lg 
          cursor-pointer transition-all duration-200 
          min-w-[230px] text-center"
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
      )}
    </div>
  );
};

//* Chance Display Component
const ChanceDisplay = ({ prizeReveal }: { prizeReveal: boolean }) => {
  const remainingCredit = useGameStore((s) => s.remainingCredit);
  return (
    <div
      className="relative z-10 text-center px-4 rounded-lg"
      style={{ paddingBlock: "2rem" }}
    >
      <h1 className="text-2xl! md:text-4xl! font-bold! text-white mb-4! drop-shadow-lg!">
        3D Treasure Box Game
      </h1>
      <p className="text-lg! md:text-xl! text-white drop-shadow-md!">
        {getGameHeader(
          prizeReveal
            ? remainingCredit
              ? remainingCredit - 1
              : 0
            : remainingCredit
              ? remainingCredit
              : 0,
        )}
      </p>
    </div>
  );
};

const BoxMainGame: React.FC = () => {
  const gameSession = useGameStore((s) => s.gameSession);
  const widgetSettings = useGameStore((s) => s.widgetSettings);
  const remainingCredit = useGameStore((s) => s.remainingCredit);
  const { prizes, gameStarted, startGame, showWinModal, boxClicked } =
    useBox3D();

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
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-100">
      <div className="bg-white text-black p-10 rounded-4xl max-w-lg w-full flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center sticky mb-3">
          <p className="text-2xl font-bold">Prizes You Can Win</p>
          <XIcon
            className="cursor-pointer"
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
                    "/game_assets/treasure_box/box_prize1.png"
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
        <div className="flex flex-col gap-3 mt-3">
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
      className="flex flex-col relative game-container"
      style={{
        height: "calc(var(--vh) * 100)",
        background:
          remainingCredit === 0 || showWinModal
            ? "rgba(0,0,0,0.5)"
            : "transparent",
      }}
    >
      <GameCheckpoint
        game={{
          name: "3D Treasure Box Game",
          detail: `Click on the treasure box to open it and win amazing prizes. You have ${remainingCredit} game ${(remainingCredit ?? 0) > 1 ? "credits" : "credit"}.`,
          status: gameStarted ? "started" : "idle",
          onStart: startGame,
        }}
      />

      {showInstructions && <InstructionModal />}

      {/* Chances Display */}
      <ChanceDisplay prizeReveal={boxClicked} />

      {/* Win Modal */}
      {showWinModal && gameSession.status !== "loading" && <PrizeDisplay />}

      {gameSession.status === "loading" && gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        {gameSession.status === "loading" && gameStarted ? null : <Scene3D />}
        {/* Game Prize Instructions */}
        {widgetSettings && widgetSettings.iconDisplay && (
          <GiftIcon
            top={widgetSettings?.verticalPosVal}
            offset={widgetSettings?.horizontalPosVal}
            side={widgetSettings.position}
            bgColor={widgetSettings.iconBg}
            iconColor={widgetSettings.iconColor}
            onClick={() => setShowInstructions(!showInstructions)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 w-full py-4 flex justify-center">
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
  );
};

export default BoxMainGame;
