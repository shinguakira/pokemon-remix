import { useEffect, useRef } from 'react';

declare global {
	interface Window {
		p5: any;
	}
}

export default function Game() {
	const gameContainerRef = useRef<HTMLDivElement>(null);
	const scriptsLoaded = useRef(false);

	useEffect(() => {
		if (typeof window === 'undefined' || scriptsLoaded.current) return;
		scriptsLoaded.current = true;

		// Prevent arrow keys from scrolling the page
		const preventScroll = (e: KeyboardEvent) => {
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(e.key)) {
				e.preventDefault();
			}
		};
		window.addEventListener('keydown', preventScroll);

		// Load p5.js script first
		const loadP5 = () => {
			return new Promise<void>((resolve) => {
				if (window.p5) {
					resolve();
					return;
				}
				const script = document.createElement('script');
				script.src = '/src/lib/p5.min.js';
				script.onload = () => resolve();
				document.body.appendChild(script);
			});
		};

		// Then load game module
		const initGame = async () => {
			await loadP5();
			try {
				const { createGame } = await import('../../src/Game');
				createGame();
			} catch (error) {
				console.error('Failed to load game:', error);
			}
		};

		initGame();

		return () => {
			window.removeEventListener('keydown', preventScroll);
		};
	}, []);

	return (
		<div className="game-container" ref={gameContainerRef}>
			<canvas id="game" className="max-w-full object-contain" />
		</div>
	);
}
