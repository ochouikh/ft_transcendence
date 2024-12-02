import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import UserBox from "./UserBox";
import { motion } from "framer-motion";
import LayoutHeader from "@/layout/LayoutHeader";
import Title from "@/components/Title";
import { useGlobalContext } from "@/contexts/store";
import AI_IMG from "/AI_IMG.svg"
import P1_IMG from "/P1_IMG.svg"
import P2_IMG from "/P2_IMG.svg"

const Result = ({isAI, rightScore, leftScore}: {isAI: boolean, rightScore: number, leftScore: number}) => {
	const navigate = useNavigate();
	const { state } =  useGlobalContext();

	const clickHandler = () => {
		navigate("/ping-pong");
	}

	return (
		<div className="w-full">
			<LayoutHeader>Game Over</LayoutHeader>
			<motion.div className="w-full flex flex-col justify-between items-center space-y-5"
			initial="hidden"
			animate="visible"
			>
				<motion.h1 initial={{opacity: 0, top: '-5rem'}} animate={{opacity: 1, top: '0rem'}} transition={{duration: 0.3}}>
					<Title firstCharClassName="text-2xl sm:text-4xl text-[#14FF67]" restWordClassName="text-lg sm:text-3xl text-[#14FF67]">End Game</Title>
				</motion.h1>
				<motion.span
				initial={{opacity: 0, top: '-5rem'}}
				animate={{opacity: 1, top: '0rem'}}
				transition={{duration: 0.3, delay: 1}}
				className="relative top-0 text-center text-[20px]">Final score:</motion.span>
				<motion.div
				initial={{opacity: 0, top: '-5rem'}}
				animate={{opacity: 1, top: '0rem'}}
				transition={{duration: 0.3, delay: 1.5}}
				className="border border-border shrink-0 flex sm:flex-row flex-col w-full justify-between items-center gap-4 p-5 rounded-md">
					<UserBox username={isAI ? 'AI' : 'player 2'} userImage={isAI ? AI_IMG : P2_IMG} className="self-start" />
					<div className="flex gap-3 shrink-0" >
						<div className="size-16 flex justify-center items-center rounded-[10px] border border-border bg-secondary text-[32px] ">
							{leftScore}
						</div>
						<div className={"size-16 flex justify-center items-center rounded-[10px] border border-border bg-secondary text-[32px] " + (isAI ? 'text-primary' : '')}>
							{rightScore}
						</div>
					</div>
					<UserBox direction="right" username={isAI ? 'you' : 'player 1'} userImage={ isAI ? state.userData?.profile_image : P1_IMG } className="self-end" />
				</motion.div>
				<motion.div
				initial={{opacity: 0, top: '-5rem'}}
				animate={{opacity: 1, top: '0rem'}}
				transition={{duration: 0.3, delay: 2}}
				onClick={clickHandler}
				className="relative top-0 max-w-[344px] h-full w-4/5 sm:w-full">
					<Button className="h-full w-full">continue</Button>
				</motion.div>
			</motion.div>
		</div>
	);
}

export default Result;