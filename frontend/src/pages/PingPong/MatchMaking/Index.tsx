import User from "@/components/User";
import { Levels, usePingPongContext } from "@/contexts/pingPongProvider";
import { createContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/contexts/store";
import CustomizeTab from "../../Settings/CustomizeTab";
import { Section, SectionContent, SectionHeader } from "../../Settings/Index";
import LayoutHeader from "@/layout/LayoutHeader";
import { useTournamentContext } from "@/contexts/TournamentProvider";

export const customizeContext = createContext<any>({});

function MatchMaking({isTournament}: {isTournament: boolean}) {
	const {state} = isTournament ? useTournamentContext() : usePingPongContext();
	const {state: profileData} = useGlobalContext();
	const navigate = useNavigate();
	const [isActivated, setIsActivated] = useState(false);

	const cancelAction = () => {
		!isTournament && navigate("/ping-pong");
	}

	useEffect(() => {
		if (isTournament && state.level !== Levels.OpponentFound)
			navigate("/tournament", { replace: true });
		else if (isTournament && state.level === Levels.UNINSTANTIATED) {
			navigate("/dashboard", { replace: true });
		}
	}, []);

	useEffect(() => {
		if ((state.level === Levels.OpponentFound && state.timer <= 3) || state.result.isEndGame)
			navigate('../play', { replace: true });
	}, [state.level, state.timer, state.result.isEndGame]);

	return (
		<>
			<LayoutHeader>Matchmaking</LayoutHeader>
			<div className="space-y-5">
			<div className="w-full flex justify-end mb-5">
				{
					state.level === Levels.OpponentFound ?
					<Loader isTournament={isTournament} />
					:
					( isTournament ? <></> : <span onClick={cancelAction} className="cursor-pointer hover:underline duration-300 select-none">cancel</span> )
				}
			</div>
			<div>
				<div className="flex justify-between items-center sm:flex-row flex-col gap-5 select-none py-4 border border-border rounded-lg px-10">
					<div className="flex items-center gap-5 flex-1 justify-start self-start">
						<User className="size-28 border-primary" border url={profileData.userData?.profile_image} />
						<div>
							<h3>{ isTournament ? state.alias : profileData.userData?.username }</h3>
							<h4>{ 'Lvl ' + profileData.userData?.level.current }</h4>
						</div>
					</div>
					<div className="relative w-[51px] h-[60px]">
						<span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-[43%] w-full border-b -rotate-[57deg]"/>
						<span className="absolute -translate-x-1/2 -translate-y-1/2 top-[44%] left-1/2 text-4xl italic">vs</span>
					</div>
					{state.level === Levels.FindingOpponent &&
						<div className="flex-1 flex justify-end items-center gap-5 self-end">
							<div className="flex flex-col gap-2 items-end">
								<div className="w-20 h-4 bg-gray2 animate-pulse rounded-lg"></div>
								<div className="w-12 h-4 bg-gray2 animate-pulse rounded-lg"></div>
							</div>
							<div className="size-28 rounded-full bg-gray2 animate-pulse"></div>
						</div>
					}
					{state.level === Levels.OpponentFound && 
						<motion.div
							initial={{x: 10, opacity: 0}}
							animate={{x: 0, opacity: 1}}
							transition={{duration: 0.3}}
							className="flex-1 flex justify-end items-center gap-5 self-end"
							>
							<div>
								<h3>{ isTournament ? state.opponentAlias : state.opponent?.username }</h3>
								<h4>{ 'Lvl ' + state.opponent?.level.current }</h4>
							</div>
							<User className="size-28 border-primary" border url={state.opponent?.profile_image} />
						</motion.div>
					}
				</div>
			</div>
			<Section activated={isActivated}>
				<SectionHeader onClick={() => setIsActivated(prev => !prev)}>Display Settings</SectionHeader>
				{true && 
					<SectionContent>
						<CustomizeTab />
					</SectionContent>}
			</Section>
			</div>
		</>
	);
}


function Loader({isTournament}: {isTournament: boolean}) {
	const { state } = isTournament ? useTournamentContext() : usePingPongContext();

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
				duration: state.timer - 3,
				ease: 'easeIn'
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
				{state.timer - 3}
			</div>
		</motion.div>
	)
}

export default MatchMaking;