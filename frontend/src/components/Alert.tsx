import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/contexts/store";
import { useEffect, useState } from "react";

const Alert = () => {
	const { state } = useGlobalContext()
	const [remainingTime, setRemainingTime] = useState(1300);
	const [progress, setProgress] = useState<number>(0);

	useEffect(() => {
		state.alert.timer && setRemainingTime(state.alert.timer)
		if (!state.alert.state || !state.alert.timer) return
		
		const interval = setInterval(() => {
		  setRemainingTime((prevTime) => {
			if (prevTime <= 0) {
			  clearInterval(interval)
			  setProgress(0)
			  return 0
			}
			return prevTime - 10
		  })
		}, 10)
	
		return () => {
			clearInterval(interval);
			setProgress(0)
		}
	  }, [state.alert.state])

	useEffect(() => {
		if (!state.alert.state || !state.alert.timer) return;
		const newProgress = ((state.alert.timer - remainingTime) / state.alert.timer) * 100;
		setProgress(newProgress)
	}, [remainingTime])

	return (
		<AnimatePresence>
			{
				state.alert.state &&
				<div
					className="relative z-50">
						<motion.div
							initial={{y: -10, opacity: 0, x: -50 + '%'}}
							animate={{y: 0, opacity: 1, x: -50 + '%'}}
							exit={{y: 10, opacity: 0, x: -50 + '%'}}
							transition={{
								ease: 'easeInOut',
								duration: 0.3,
							}}
							className={"fixed z-0 w-11/12 top-24 left-1/2 bg-secondary border border-border text-center py-3 px-3 sm:px-8 md:px-16 rounded-md sm:w-auto " + (state.alert.isError ? 'text-invalid' : 'text-primary')}>
							{state.alert.message}
							{state.alert.timer && <div 
								className={"absolute ml-2 left-0 bottom-0 z-10 h-[1px] transition-all duration-100 ease-linear " + (state.alert.isError ? 'bg-invalid' : 'bg-primary')}
								style={{ width: `${progress}%` }}
							/>}
						</motion.div>
				</div>
			}
		</AnimatePresence>
	)
}

export default Alert;