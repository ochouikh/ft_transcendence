import User from "@/components/User";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/contexts/store";
import CustomizeTab from "../../Settings/CustomizeTab";
import { Section, SectionContent, SectionHeader } from "../../Settings/Index";
import LayoutHeader from "@/layout/LayoutHeader";
import AI_IMG from "/AI_IMG.svg"
import P1_IMG from "/P1_IMG.svg"
import P2_IMG from "/P2_IMG.svg"

function MatchMaking({isAI}: {isAI: boolean}) {
	const { state } =  useGlobalContext();
	const navigate = useNavigate();
	const [timer, setTimer] = useState<number>(9);

	const cancelAction = () => navigate("/ping-pong");

	const handler = () => (timer > 0) && setTimer(prev => prev - 1);

	useEffect(() => {
		const id = setInterval(handler, 1000);
		(timer == 0) && navigate('play');
		return () => clearInterval(id);
	}, [timer]);

	return (
		<>
			<LayoutHeader>Matchmaking</LayoutHeader>
			<div className="space-y-5">
			<div className="w-full flex justify-between mb-5">
				<Loader timer={timer} />
				<span onClick={cancelAction} className="cursor-pointer hover:underline duration-300 select-none">cancel</span>
			</div>
			<div>
				<div className="flex justify-between items-center sm:flex-row flex-col gap-5 select-none py-4 border border-border rounded-lg px-10">
					<div className="flex items-center gap-5 flex-1 justify-start self-start">
						<User className="size-28 border-primary" url={isAI ? AI_IMG : P2_IMG} />
						<h3>{isAI ? 'AI' : 'player 2'}</h3>
					</div>
					<div className="relative w-[51px] h-[60px]">
						<span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-[43%] w-full border-b -rotate-[57deg]"/>
						<span className="absolute -translate-x-1/2 -translate-y-1/2 top-[44%] left-1/2 text-4xl italic">vs</span>
					</div>
					<div className="flex-1 flex justify-end items-center gap-5 self-end">
						<h3>{ isAI ? 'you' : 'player 1' }</h3>
						<User className="size-28 border-primary" border={isAI} url={isAI ? state.userData?.profile_image : P1_IMG} />
					</div>
				</div>
			</div>
			<Section activated={true}>
				<SectionHeader>Display Settings</SectionHeader>
				{true && 
					<SectionContent>
						<CustomizeTab />
					</SectionContent>}
			</Section>
			</div>
		</>
	);
}


function Loader({timer}: {timer: number}) {

	return (
		<motion.div
			initial={{background: `conic-gradient(from 0deg, 
				var(--primary-color) 0%, 
				var(--primary-color) ${'0%'}, 
				var(--secondary-color) ${'0%'}, var(--secondary-color) 100%)`}}
			animate={{background: `conic-gradient(from 0deg, 
				var(--primary-color) 0%, 
				var(--primary-color) ${'100%'}, 
				var(--secondary-color) ${'100%'}, var(--secondary-color) 100%)`}}
			transition={{
				duration: timer,
				ease: 'easeOut'
			}}
			className="relative size-[40px] self-center rounded-full sm:shrink-0 flex justify-center items-center"
			style={{
				background: `conic-gradient(from 0deg, 
					var(--primary-color) 0%, 
					var(--primary-color) ${'100%'}, 
					var(--secondary-color) ${'100%'}, var(--secondary-color) 100%)`
				}}
			>
			<div className="size-[30px] text-sm bg-secondary rounded-full flex justify-center items-center">
				{timer}
			</div>
		</motion.div>
	)
}

export default MatchMaking;