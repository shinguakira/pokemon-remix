import { useEffect, useRef } from "react";

export default function Game() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{ start: () => void } | null>(null);

  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window === "undefined") return;

    // Dynamically import the game module (client-side only)
    const initGame = async () => {
      try {
        const { createGame } = await import("../../src/Game");
        gameRef.current = createGame();
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    initGame();

    // Cleanup function
    return () => {
      // Game cleanup would go here if needed
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="game-container" ref={gameContainerRef}>
      <canvas id="game" className="max-w-full object-contain"></canvas>
    </div>
  );
}
