import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { usePingPongContext } from "@/contexts/pingPongProvider";
import UserBox from "./UserBox";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTournamentContext } from "@/contexts/TournamentProvider";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import LayoutHeader from "@/layout/LayoutHeader";
import Title from "@/components/Title";

function Result({isTournament}: {isTournament: boolean}) {
	const {state, dispatch} = isTournament ? useTournamentContext() : usePingPongContext();
	const { state: globalState, dispatch: dispatchGlobal } = useGlobalContext();
	const navigate = useNavigate();
	const [xp, setXp] = useState<number>(0);

	const clickHandler = () => {
		if (!isTournament)
		{
			dispatchGlobal({ type: STORE_OPTS.GAME_ID, gameId: null });
			navigate("/ping-pong");
		}
	}

	useEffect(() => {
		const id = setTimeout(() => {
			if (xp < state.result.xp)
				setXp((prev) => prev + 1);
		}, 10);
		return () => clearTimeout(id);
	}, [xp]);

	useEffect(() => {
		if (state.timeResult === 0) {
			dispatch({ type: 'RESET_BETA' });
			navigate("/tournament");
		}
	}, [state.timeResult]);

	return (
		<div className="w-full">
		<LayoutHeader>Game Over</LayoutHeader>
		<motion.div 
			className="w-full flex flex-col justify-between items-center text-center space-y-5"
			initial="hidden"
			animate="visible"
			>
			{
				(state.result.status == "win") && 
				<motion.div 
					initial={{opacity: 0, top: '-5rem'}} 
					animate={{opacity: 1, top: '0rem'}} 
					transition={{duration: 0.3}}
					>
						<Title firstCharClassName="text-2xl sm:text-4xl text-[#14FF67]" restWordClassName="text-lg sm:text-3xl text-[#14FF67]">Congratulations, you win</Title></motion.div>
			}
			{
				(state.result.status == "qualified") && 
				<motion.div 
					initial={{opacity: 0, top: '-5rem'}} 
					animate={{opacity: 1, top: '0rem'}} 
					transition={{duration: 0.3}}
					>
						<Title firstCharClassName="text-2xl sm:text-4xl text-[#14FF67]" restWordClassName="text-lg sm:text-3xl text-[#14FF67]">Qualified</Title></motion.div>
			}
			{
				(state.result.status == "lose") && 
				<motion.div 
					initial={{opacity: 0, top: '-5rem'}} 
					animate={{opacity: 1, top: '0rem'}} 
					transition={{duration: 0.3}}
					>
						<Title firstCharClassName="text-2xl sm:text-4xl text-red-600" restWordClassName="text-lg sm:text-3xl text-red-600">oops, You Lose</Title></motion.div>
			}
			{
				(state.result.status == "eliminated") && 
				<motion.div 
					initial={{opacity: 0, top: '-5rem'}} 
					animate={{opacity: 1, top: '0rem'}} 
					transition={{duration: 0.3}}
					>
						<Title firstCharClassName="text-2xl sm:text-4xl text-red-600" restWordClassName="text-lg sm:text-3xl text-red-600">Eliminated</Title></motion.div>
			}
			{
				(state.result.status == "equal") && 
				<motion.div 
					initial={{opacity: 0, top: '-5rem'}} 
					animate={{opacity: 1, top: '0rem'}} 
					transition={{duration: 0.3}}
					>
						<Title firstCharClassName="text-2xl sm:text-4xl text-gray1" restWordClassName="text-lg sm:text-3xl text-gray1">Null</Title></motion.div>
			}
			<motion.div
				initial={{opacity: 0, top: '-5rem'}}
				animate={{opacity: 1, top: '0rem'}}
				transition={{duration: 0.3, delay: 1}}
				className="w-full flex justify-between">
				<span
					className="relative top-0 text-center text-[20px]">Final score:</span>
				{
					!isTournament &&
					<span
					className="text-[#FFD214] text-center text-[20px]">+{xp} XP</span>
				}
		
			</motion.div>
			<motion.div
				initial={{opacity: 0, top: '-5rem'}}
				animate={{opacity: 1, top: '0rem'}}
				transition={{duration: 0.3, delay: 1.5}}
				className="border border-border shrink-0 flex sm:flex-row flex-col w-full justify-between items-center gap-4 p-5 rounded-md">
				<UserBox username={isTournament ? state.alias : globalState.userData?.username} level={globalState.userData?.level.current} userImage={globalState.userData?.profile_image} className="self-start" />
				<div className="flex gap-3 shrink-0">
					<div className={"size-16 flex justify-center items-center rounded-[10px] border border-border bg-secondary text-[32px] " + ((state.result.status == "win") ? "text-primary" : "")}>
						{state.score.my}
					</div>
					<div className={"size-16 flex justify-center items-center rounded-[10px] border border-border bg-secondary text-[32px] " + ((state.result.status == "lose") ? "text-primary" : "")}>
						{state.score.side}
					</div>
				</div>
				<UserBox direction="right" username={isTournament ? state.opponentAlias : state.opponent?.username} level={state.opponent?.level.current} userImage={state.opponent?.profile_image} className="self-end" />
			</motion.div>
			{
				!isTournament &&
				<motion.div
				initial={{opacity: 0, top: '-5rem'}}
				animate={{opacity: 1, top: '0rem'}}
				transition={{duration: 0.3, delay: 2}}
				onClick={clickHandler}
				className="relative top-0 max-w-[344px] h-full w-4/5 sm:w-full">
					<Button className="h-full w-full">continue</Button>
				</motion.div>
			}
		</motion.div>
		</div>
	);
}

export default Result;