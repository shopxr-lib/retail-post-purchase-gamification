import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useBlindBox } from "./BlindBoxContext";

// This component handles all the game animations and logic
export default function BlindBoxLogic(): JSX.Element {
  const {
    gamePhase,
    selectedBoxIndex,
    currentPrize,
    // remainingChances,
    // isAnimating,
    setAnimating,
    PRIZE_DETAILS,
  } = useBlindBox();

  // Refs for animation targets
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prizeRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Set up refs array for the three boxes
  useEffect(() => {
    boxRefs.current = boxRefs.current.slice(0, 3);
  }, []);

  // Main animation sequence when a box is selected
  useEffect(() => {
    if (gamePhase === "boxSelected" && selectedBoxIndex >= 0) {
      animateBoxSelection();
    }
  }, [gamePhase, selectedBoxIndex]);

  // Animation sequence for box selection and prize reveal
  const animateBoxSelection = (): void => {
    const selectedBox = boxRefs.current[selectedBoxIndex];
    const otherBoxes = boxRefs.current.filter(
      (_, index) => index !== selectedBoxIndex,
    );

    if (!selectedBox) return;

    setAnimating(true);

    // Create GSAP timeline for smooth sequenced animations
    const tl = gsap.timeline();

    // Step 1: Move selected box up to reveal prize
    tl.to(selectedBox, {
      y: -100,
      duration: 0.8,
      ease: "power2.out",
    })
      // Step 2: Show prize with fade-in effect
      .to(
        prizeRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      )
      // Step 3: Wait a moment, then zoom in selected box
      .to(selectedBox, {
        scale: 2,
        x: 0,
        y: 0,
        duration: 1,
        ease: "power2.inOut",
        delay: 1,
      })
      // Step 4: Fade out other boxes
      .to(
        otherBoxes.filter((box): box is HTMLDivElement => box !== null),
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.8",
      )
      // Step 5: Final positioning
      .set(selectedBox, {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%) scale(2)",
      })
      .call(() => {
        setAnimating(false);
      });
  };

  // Reset animations when starting new game
  useEffect(() => {
    if (gamePhase === "initial") {
      resetAnimations();
    }
  }, [gamePhase]);

  const resetAnimations = (): void => {
    // Reset all boxes to initial state
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
          transform: "none",
        });
      }
    });

    // Reset prize display
    if (prizeRef.current) {
      gsap.set(prizeRef.current, {
        opacity: 0,
        scale: 0.8,
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Prize Display - Initially hidden, shown during animation */}
      {currentPrize && (
        <div
          ref={prizeRef}
          className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     opacity-0 scale-75 z-10 p-6 rounded-lg border-2 shadow-lg`}
          style={{
            marginTop: selectedBoxIndex >= 0 ? "50px" : "0px", // Offset below the lifted box
          }}
        >
          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-2`}
            >
              {PRIZE_DETAILS[currentPrize.id]?.name}
            </div>
            <div className="text-sm text-gray-600">
              {PRIZE_DETAILS[currentPrize.id]?.description}
            </div>
          </div>
        </div>
      )}

      {/* Box refs assignment - invisible elements to track box positions */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            ref={(el) => {
              (boxRefs.current[index] = el)
            }}
            className="absolute"
            style={{
              // Position boxes based on screen size
              left:
                window.innerWidth >= 768
                  ? `${25 + index * 25}%` // Desktop: horizontal layout
                  : "50%", // Mobile: center horizontally
              top:
                window.innerWidth >= 768
                  ? "50%" // Desktop: center vertically
                  : `${30 + index * 20}%`, // Mobile: vertical layout
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
