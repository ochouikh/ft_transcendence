import { useEffect, useRef } from "react";
import Header from "./Header";
import Table from "./Table";
import LayoutHeader from "@/layout/LayoutHeader";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import { twMerge } from "tailwind-merge";
import { isMobile } from "react-device-detect";

function Game({isTournament}: {isTournament: boolean}) {
	const refParent = useRef<HTMLDivElement>(null);
	const {state, dispatch}  = useGlobalContext();

	useEffect(() => {
		const handleOrientationChange = () => {
			const orientation = window.screen.orientation.type;
			dispatch({type: STORE_OPTS.ORIENTATION, isOrientation: orientation == "landscape-primary"})
		}
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
			<div ref={refParent} className={twMerge("flex flex-col h-full max-w-[1200px] w-full justify-between items-center gap-[26px]", state.isOrientation && isMobile ? 'w-[60%]' : 'w-full')}>
				<Header isTournament={isTournament} />
				<Table isTournament={isTournament} />
			</div>
		</div>
	);
}

export default Game;