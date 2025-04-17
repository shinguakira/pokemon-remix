import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

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
        <script src="p5.min.js"></script>
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
        <script type="module" src="main.js"></script>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
