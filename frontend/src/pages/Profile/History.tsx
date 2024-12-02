import { useEffect, useRef, useState } from "react";
import HistoryChart from "./HistoryChart";
import { motion } from "framer-motion";
import { MatchesData } from "@/types/profile";
import { useNavigate, useParams } from "react-router-dom";
import Container from "@/components/Container";
import win from "/win.svg"
import loss from "/deny.svg"
import api from "@/api/axios";
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore";
import { useQuery } from "@tanstack/react-query";
import { RxValueNone } from "react-icons/rx";

export const HistorySkeleton = () => {
	return (
		<div className="row-start-5 xl:row-start-1 xl:row-span-2 xl:col-start-4 xl:col-end-8 animate-pulse">
			<Container className="h-full" childClassName="flex flex-col justify-around pt-12 sm:pt-8 pb-9 items-center">
				<h1 className="text-2xl font-semibold">last 10 matches</h1>
			</Container>
		</div>
	)
}

async function fetchData(id: string | undefined) {
	const uri: string = id ? "matches/" + id : "matches";
	const res = await api.get(uri + "/");
	return res;
}

const History = () => {
	const { id } = useParams();
	const {data, isLoading, isError, isRefetching} = useQuery({queryKey: ['matches', id], queryFn: () => fetchData(id), refetchInterval: 5000});
	const { state, dispatchProfile } = useProfileContext();
	const navigate = useNavigate();
	const parentRef = useRef(null);
	const [width, setWidth] = useState<number>(0);

	const handler = () => {
		if (!parentRef.current) return;
		setWidth((parentRef.current as HTMLElement).offsetWidth);
	}

	useEffect(() => {
		
		if (!isLoading) {
			dispatchProfile({type: PROFILE_OPTS.MATCHES_DATA, matchesData: data?.data});
		}

		if (!parentRef.current) return;
		setWidth((parentRef.current as HTMLElement).offsetWidth);

		window.addEventListener('resize', handler)

		return () => {
			window.removeEventListener('resize', handler)
		}
	}, [isLoading])

	useEffect(() => {
		if (!isRefetching)
			dispatchProfile({type: PROFILE_OPTS.MATCHES_DATA, matchesData: data?.data});
	}, [isRefetching])
	
	if (isError) {
		return (
			<div className="row-start-5 xl:row-start-1 xl:row-span-2 xl:col-start-4 xl:col-end-8">
				<Container className="h-full" childClassName="flex flex-col justify-around pt-12 sm:pt-8 pb-9 items-center">
					<h1 className="text-2xl font-semibold">last 10 matches</h1>
					<span className="text-2xl">Error</span>
				</Container>
			</div>
		)
	}
	
	const userClick = (path:string) => {
		navigate(path);
	}
	
	return (
		<div ref={parentRef} className="row-start-5 xl:row-start-1 xl:row-span-2 xl:col-start-4 xl:col-end-8">
			<Container className="h-full" childClassName="flex flex-col justify-around pt-12 sm:pt-8 pb-9 items-center">
					<h1 className="text-2xl font-semibold">last 10 matches</h1>
					{
						isLoading ?
						<span style={{width: `${width * 80 / 100}px`}} className="px-4 sm:px-10 md:px-12 lg:px-16 my-24 md:my-28 bg-[#2F2F2F] rounded-lg h-[200px]" />
						:
						<HistoryChart width={(width) * 80 / 100} height={200} data={state.matchesData}/>
					}
					<motion.div className="w-11/12 sm:w-4/5 px-2 h-[144px] flex flex-col items-center gap-3 overflow-auto scrollClass"
						initial="hidden"
						animate="visible"
						>
					{
						isLoading ?
						[1, 2, 3].map((key: number) => <div key={key} className="flex justify-between items-center min-h-[40px] w-full select-none gap-1 h-[24px] bg-[#2F2F2F] rounded-lg" />)
						:
						(
						(state.matchesData && state.matchesData.length !== 0) ? state.matchesData.map((match: MatchesData, key: number) => {
							const variant = {
								hidden: { opacity: 0, },
								visible: { opacity: 1,
									transition: { duration: 0.5, delay: 0.5 * key},
								}
							}
							let status;
							if (match.goals > match.opponent.goals) {
								status = "win";
							}
							else if (match.goals < match.opponent.goals) {
								status = "lose";
							}
							else {
								status = "draw";
							}
							return (
								<motion.div key={key} className="flex justify-between items-center min-h-[40px] w-full select-none"
								variants={variant}
								>
									<div className="grid grid-cols-3 place-items-center h-full w-1/5">
											{(status == "win") && <img className="w-[24px] h-[24px]" src={win} alt={"WIN"}/>}
											{(status == "lose") && <img className="w-[25px] h-[25px]" src={loss} alt={"LOSS"}/>}
											{(status == "draw") && <RxValueNone className="text-2xl " />}
										{
											status == "lose"
											?
											<>
												<span className="">{match.opponent.goals}</span>
												<span className="text-primary">{match.goals}</span>
											</>
											:
											<>
												<span className="text-primary">{match.goals}</span>
												<span className="">{match.opponent.goals}</span>
											</>
										}
									</div>
									<div className="flex justify-between items-center px-4 rounded-md border border-border w-4/5 h-full">
										<div onClick={() =>userClick(match.opponent.profile)} className="flex justify-between items-center cursor-pointer gap-3">
											<img className="shrink-0 w-[24px] h-[24px] rounded-full border-primary border" src={match.opponent.profile_image} alt="PROFILE_IMG"/>
											<span className="shrink overflow-hidden text-ellipsis">{match.opponent.username}</span>
										</div>
										<span className="shrink-0">lvl {match.opponent.level.current}</span>
									</div>
								</motion.div>
							);
						})
						:
						<div>No Matches Yet !!!</div>
						)
					}
					</motion.div>
			</Container>
		</div>
	)
}

export default History;