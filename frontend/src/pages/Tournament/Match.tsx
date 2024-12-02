import { useEffect, useRef, useState } from "react";
import { Player } from "@/contexts/TournamentProvider";
import Merge from "./Merge";
import PlayerBar from "./PlayerBar";

function Match({player1, player2, gap, isRightSide}: {player1: Player | "player", player2: Player | "player", gap: number, isRightSide?: boolean}) {
	const ref1 = useRef<HTMLDivElement>(null);
	const ref2 = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number>(0);
	
	const getHeight = () => {
		const top1: any = ref1.current;
		const top2: any = ref2.current;

		if (top1 && top2)
		{
			setHeight(
				isRightSide ?
				top1.getBoundingClientRect().top - top2.getBoundingClientRect().top
				:
				top2.getBoundingClientRect().top - top1.getBoundingClientRect().top
			);
		}
	}

	useEffect(() => {
		getHeight();
		window.addEventListener('resize', getHeight);
		return () => {
			window.removeEventListener('resize', getHeight);
		};
	}, []);

	return (
		<div className="flex items-center w-full">
			<div className="flex flex-col items-center justify-center" style={(gap == 0) ? {gap: "32px"} : {gap: `${gap}px`}}>
				<PlayerBar ref={ref1} player={player1} isRightSide={isRightSide}/>
				<PlayerBar ref={ref2} player={player2} isRightSide={isRightSide}/>
			</div>
			<Merge height={height}/>
		</div>
	);
}

export default Match;