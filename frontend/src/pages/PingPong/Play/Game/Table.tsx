import { useEffect, useRef, useState } from "react";
import Box from "./Box";
import { usePingPongContext } from "@/contexts/pingPongProvider";
import { useTournamentContext } from "@/contexts/TournamentProvider";
import { useGlobalContext } from "@/contexts/store";
import { AnimatePresence, motion } from "framer-motion";
import MOVE_UP from '/MOVE_UP.svg'
import MOVE_DOWN from '/MOVE_DOWN.svg'
import { isMobile } from "react-device-detect";
import { twMerge } from "tailwind-merge";

// width = 1.6 * height

const goalVariants = {
	exit: {
		scale: [1, 0.8, 0.8, 3],
		opacity: [1, 1, 1, 0],
		transition: {
			duration: 1,
			times: [ 0, 0.2, 0.3, 1]
		}
	}
}

const Goal = ({isTournament}: {isTournament: boolean}) => {
	const { state } = isTournament ? useTournamentContext() : usePingPongContext();
	const [goal, setGoal] = useState<string[]>([]);

	useEffect(() => {
		if (state.score.my !== 0)
		{
			setTimeout(() => {
				setGoal([]);
			}, 700);
			setGoal(["G", "O", "O", "O", "A", "L"]);
		}
	}, [state.score.my]);

	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<AnimatePresence>
				{
					goal.length !== 0 &&
					<motion.div
						initial={{x: "50px"}}
						animate={{x: `0px`}}
						transition={{duration: 0.6}}
						exit="exit"
						variants={goalVariants}
						className="flex">
						{
							goal.map((letter: string, key: number) => {
								return (
									<motion.span
										key={key}
										initial={{y: "1.5rem", opacity: 0}}
										animate={{y: "0rem", opacity: 1}}
										transition={{duration: 0.1, delay: key * 0.1}}
										className="text-primary text-center text-4xl italic font-black">
											{letter}
									</motion.span>
								);
							})
						}
					</motion.div>
				}
			</AnimatePresence>
		</div>
	)
}

const Table = ({isTournament}: {isTournament: boolean}) => {
	const myPaddle = useRef<HTMLDivElement>(null);
	const sidePaddle = useRef<HTMLDivElement>(null);
	const move = useRef<-1 | 0 | 1>(0);
	const table = useRef<HTMLDivElement>(null);
	const { state: globalState } = useGlobalContext();
	const { state, sendJsonMessage } = isTournament ? useTournamentContext() : usePingPongContext();

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' || e.key === 'w') {
			(e.key === 'ArrowUp') && e.preventDefault();
			move.current = -1;
		}
		if (e.key === 'ArrowDown' || e.key === 's') {
			(e.key === 'ArrowDown') && e.preventDefault();
			move.current = 1;
		}
	}

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's')
			move.current = 0;
	}

	const handleTouchStart = (type:"UP" | "DOWN") => {
		if (type == "UP") {
			move.current = -1;
		}
		if (type == "DOWN") {
			move.current = 1;
		}
	}

	const handleTouchEnd = () => {
		move.current = 0;
	}

	useEffect(() => {
		const interval = setInterval(() => {
			if (move.current === 0) return ;
			sendJsonMessage({
				type: "update",
				y: move.current,
			});
		}, 50);

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			clearInterval(interval);
		}
	}, [])

	return (
		<div ref={table} className="select-none relative w-full aspect-video">
			<div className="absolute first-table-half w-[68.69%] h-full border rounded-l-[10px] border-border" style={{ backgroundColor: globalState.userData?.game_settings.background + "1a" }} />
			<div className="absolute second-table-half w-[68.69%] h-full border rounded-l-[10px] rotate-180 left-full -translate-x-full border-border" style={{ backgroundColor: globalState.userData?.game_settings.background + "1a" }} />

			<div ref={myPaddle} className="h-1/5 absolute -translate-y-1/2 rounded-full w-[2%]" style={{backgroundColor: globalState.userData?.game_settings.paddle, top: `${state.myPaddleData.y}%`, left: `${state.myPaddleData.x}%`}}/>

			<div ref={sidePaddle} className="h-1/5 absolute -translate-y-1/2 rounded-full w-[2%]" style={{backgroundColor: globalState.userData?.game_settings.paddle, top: `${state.sidePaddleData.y}%`, left: `${state.sidePaddleData.x}%`}}/>

			<div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full w-[3%] aspect-square" style={{backgroundColor: globalState.userData?.game_settings.ball, top: `${state.ballData.y}%`, left: `${state.ballData.x}%`}} />

			<Goal isTournament={isTournament}/>

			<svg className="absolute w-[37.38%] h-full left-1/2 -translate-x-1/2">
				<line x1={'100%'} x2={'0%'} y1={'0%'} y2={'100%'} className="stroke-1 stroke-border2" />
			</svg>
			<Box isTournament={isTournament}/>
			{
				isMobile &&
				<div className={twMerge("absolute left-1/2 -translate-x-1/2 flex justify-between items-center", globalState.isOrientation ?
					"top-1/2 -translate-y-1/2 w-[150%]" : "top-[105%] -translate-y-0 w-full")}>
					<img onTouchStart={() => handleTouchStart("DOWN")} onTouchEnd={handleTouchEnd} src={MOVE_DOWN} alt="MOVE_DOWN" className="size-9 cursor-pointer" />
					<img onTouchStart={() => handleTouchStart("UP")} onTouchEnd={handleTouchEnd} src={MOVE_UP} alt="MOVE_UP" className="size-9 cursor-pointer" />
				</div>
			}
		</div>
	)
}

export default Table;