import { useEffect, useRef } from "react";

export default function Game() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window === "undefined") return;

    // Load p5.js script
    const loadP5Script = () => {
      return new Promise<void>((resolve) => {
        if (window.p5) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "/p5.min.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    // Load game script
    const loadGameScript = () => {
      return new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "/game-bundle.js";
        script.type = "module";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    const initGame = async () => {
      await loadP5Script();
      await loadGameScript();
    };

    initGame();

    // Cleanup function
    return () => {
      const p5Script = document.querySelector('script[src="/p5.min.js"]');
      const gameScript = document.querySelector('script[src="/game-bundle.js"]');
      
      if (p5Script) {
        p5Script.remove();
      }
      
      if (gameScript) {
        gameScript.remove();
      }
    };
  }, []);

  return (
    <div className="game-container" ref={gameContainerRef}>
      <canvas id="game"></canvas>
    </div>
  );
}
