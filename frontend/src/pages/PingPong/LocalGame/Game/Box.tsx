import { motion } from "framer-motion";
import Help from "./Help";
import Ready from "./Ready";
import { Dispatch, SetStateAction, useEffect } from "react";

function Box({isAI, counter, setCounter, status}: {isAI: boolean, counter: number, setCounter: Dispatch<SetStateAction<number>>, status: "ready" | "help"}) {

	useEffect(() => {
		const id = setTimeout(() => {
			if (counter > 0)
				setCounter(prev => prev - 1);
		}, 1000);
		return () => {
			clearTimeout(id)
		}
	}, [counter]);

	return (
			(counter > 0)
			?
			<motion.div
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{duration: 0.3}}
				className={`flex flex-col justify-between items-center absolute duration-150 bg-gray3 rounded-[10px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1/2`}>
				{
					(status == "ready") ?
					<Ready counter={counter}/>
					:
					<Help isAI={isAI} />
				}
				<motion.div
				initial={{width: '100%'}}
				animate={{width: '0%'}}
				transition={{duration: counter, ease: 'easeOut'}}
				className="self-start h-[2px] w-full bg-primary" />
			</motion.div>
			:
			<>
			</>
	);
}

export default Box;