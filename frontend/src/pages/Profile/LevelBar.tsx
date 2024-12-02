import {motion} from 'framer-motion'

const LevelBar = ({current, progress}: {current: number, progress: number}) => {
	return (
		<motion.div className="w-full flex flex-col justify-between xl:w-[585px] 2xl:w-[685px] self-end">
			<div className="flex justify-between mb-2">
				<span className="font-thin">LVL {current}</span>
				<span className="font-thin">LVL {current + 1}</span>
			</div>
			<div className="level-bar w-full bg-[#2F2F2F] h-[18px]">
				<motion.div 
					initial={{x: `${0 - 100}%`}}
					animate={{x: `${progress - 100}%`}}
					transition={{
						duration: 1,
						ease: 'easeOut'
					}}
					className="level-bar w-full bg-primary h-full"
					style={{transform: `translateX(${progress - 100}%)`}}
				></motion.div>
			</div>
		</motion.div>
	)
}

export default LevelBar;