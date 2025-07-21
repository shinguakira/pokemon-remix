import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Component to load external scripts
function ExternalScripts() {
  useEffect(() => {
    // Load p5.min.js
    const p5Script = document.createElement("script");
    p5Script.src = "/p5.min.js";
    p5Script.async = true;
    document.body.appendChild(p5Script);
    
    // Load main.js after p5 is loaded
    p5Script.onload = () => {
      const mainScript = document.createElement("script");
      mainScript.src = "/main.js";
      mainScript.type = "module";
      document.body.appendChild(mainScript);
    };
    
    return () => {
      // Clean up scripts on unmount
      document.querySelectorAll('script[src="/p5.min.js"], script[src="/main.js"]').forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);
  
  return null;
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pokemon Remix</title>
        <Meta />
        <Links />
        <style>
          {`
            body {
              height: 100vh;
              margin: 0;
              display: flex;
              justify-content: center;
              background-image: url("/assets/background-art.jpeg");
              background-size: cover;
              background-position: center;
            }

            canvas {
              max-width: 100%;
              object-fit: contain;
            }
          `}
        </style>
      </head>
      <body>
        <canvas id="game"></canvas>
        <ExternalScripts />
        <script dangerouslySetInnerHTML={{
          __html: `
            // prevent itch.io scrolling
            window.addEventListener("keydown", (e) => {
              if (
                ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
                  e.key
                )
              ) {
                e.preventDefault();
              }
            });
          `
        }} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
