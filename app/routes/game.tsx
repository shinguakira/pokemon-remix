import { MetaFunction } from "@remix-run/node";
import Game from "~/components/Game";

export const meta: MetaFunction = () => {
  return [
    { title: "Pokemon Game" },
    { name: "description", content: "Pokemon Game built with p5.js and Remix" },
  ];
};

export default function GameRoute() {
  return (
    <div className="game-page">
      <Game />
      <style jsx="true">{`
        .game-page {
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-size: cover;
          background-position: center;
        }
        
        :global(canvas) {
          max-width: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}
