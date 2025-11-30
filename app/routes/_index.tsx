import type { MetaFunction } from '@remix-run/node';
import Game from '~/components/Game';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Pokemon Remix' },
		{ name: 'description', content: 'Pokemon Game built with p5.js and Remix' },
	];
};

export default function Index() {
	return (
		<div
			className="h-full m-0 flex justify-center items-center bg-cover bg-center"
			style={{ backgroundImage: "url('/assets/background-art.jpeg')" }}
		>
			<Game />
		</div>
	);
}
