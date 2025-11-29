import { useEffect, useRef } from "react";

declare global {
  interface Window {
    p5: any;
  }
}

export default function Game() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || scriptsLoaded.current) return;
    scriptsLoaded.current = true;

    // Load p5.js script
    const loadP5 = () => {
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

    // Load main game script
    const loadGame = () => {
      return new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "/main.js";
        script.type = "module";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    const init = async () => {
      await loadP5();
      await loadGame();
    };

    init();

    return () => {
      // Cleanup scripts on unmount
      document
        .querySelectorAll('script[src="/p5.min.js"], script[src="/main.js"]')
        .forEach((s) => s.remove());
    };
  }, []);

  return (
    <div className="game-container" ref={gameContainerRef}>
      <canvas id="game" className="max-w-full object-contain"></canvas>
    </div>
  );
}
