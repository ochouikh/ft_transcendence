import { Dispatch, forwardRef, SetStateAction, useEffect, useRef } from "react";
import Header from "./Header";
import Table from "./Table";
import LayoutHeader from "@/layout/LayoutHeader";
import { twMerge } from "tailwind-merge";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import { isMobile } from "react-device-detect";

interface Props {
	rightPaddle: any,
	leftPaddle: any,
	leftScore: number,
	rightScore: number,
	gameLogic: any,
	minutes: number,
	seconds: number,
	counter: number,
	rightMoves: any,
	leftMoves: any,
	setCounter: Dispatch<SetStateAction<number>>,
	status: "ready" | "help",
	setStatus: Dispatch<SetStateAction<"ready" | "help">>,
	isAI: boolean,
}

const Game = forwardRef((props: Props, ref: any) => {
	const refParent = useRef<HTMLDivElement>(null);
	const {state, dispatch}  = useGlobalContext();

	const handleOrientationChange = () => {
		const orientation = window.screen.orientation.type;
		dispatch({type: STORE_OPTS.ORIENTATION, isOrientation: orientation == "landscape-primary"})
	}

	useEffect(() => {
		handleOrientationChange();
		window.addEventListener('orientationchange', handleOrientationChange);
		return () => {
			dispatch({type: STORE_OPTS.ORIENTATION, isOrientation: false});
			window.removeEventListener('orientationchange', handleOrientationChange);
		};
	}, [])

	return (
		<div className="flex flex-col items-center w-full">
			{
				state.isOrientation && isMobile ?
				<></>
				:
				<LayoutHeader className="w-full">Playing...</LayoutHeader>
			}
			<div ref={refParent} className={twMerge("min-h-[calc(100vh-80px-40px)] max-w-[1200px] space-y-2", state.isOrientation && isMobile ? 'w-[60%]' : 'w-full')}>
				<Header isAI={props.isAI} counter={props.counter} setCounter={props.setCounter} status={props.status} setStatus={props.setStatus} leftScore={props.leftScore} rightScore={props.rightScore} minutes={props.minutes} seconds={props.seconds} />
				<Table ref={ref} leftMoves={props.leftMoves} rightMoves={props.rightMoves} isAI={props.isAI} leftScore={props.leftScore} rightScore={props.rightScore} status={props.status} counter={props.counter} setCounter={props.setCounter} gameLogic={props.gameLogic} leftPaddle={props.leftPaddle} rightPaddle={props.rightPaddle} />
			</div>
		</div>
	);
})

export default Game;