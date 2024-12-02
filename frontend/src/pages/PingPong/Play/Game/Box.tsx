import { motion } from "framer-motion";
import Help from "./Help";
import Ready from "./Ready";
import { usePingPongContext } from "@/contexts/pingPongProvider";
import { useTournamentContext } from "@/contexts/TournamentProvider";
import { useEffect } from "react";

function Box({isTournament} : {isTournament: boolean}) {
	const { state, dispatch } = isTournament ? useTournamentContext() : usePingPongContext();

	useEffect(() => {
		const id = setInterval(() => {
			if (state.counter > 0)
				dispatch({type: "COUNTER", counter: state.counter - 1})
		}, 1000);
		return () => {
			clearInterval(id)
		}
	}, [state.counter]);

	return (
		<>
		{
			(state.timer >= 0) &&
			<motion.div
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{duration: 0.3}}
				className={`flex flex-col justify-between items-center absolute duration-150 bg-gray3 rounded-[10px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1/2`}>
				<Ready counter={state.timer}/>
				<motion.div
				initial={{width: '100%'}}
				animate={{width: '0%'}}
				transition={{duration: state.timer, ease: 'easeOut'}}
				className="self-start h-[2px] w-full bg-primary" />
			</motion.div>
		}
		{
			(state.counter > 0) &&
			<motion.div
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{duration: 0.3}}
				className={`flex flex-col justify-between items-center absolute duration-150 bg-gray3 rounded-[10px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1/2`}>
				<Help />
				<motion.div
				initial={{width: '100%'}}
				animate={{width: '0%'}}
				transition={{duration: state.counter, ease: 'easeOut'}}
				className="self-start h-[2px] w-full bg-primary" />
			</motion.div>
		}
		</>
	);
}

export default Box;