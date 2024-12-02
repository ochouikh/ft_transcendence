import { createContext, useState } from "react";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import JoinTournament from "./JoinTournament";
import Title from "@/components/Title";
import { useTournamentContext } from "@/contexts/TournamentProvider";
import { ReadyState } from "react-use-websocket";

export const displayContext = createContext<any>({});

const Tournaments = () => {
	const [display, setDisplay] = useState<boolean>(false);
	const { readyState } = useTournamentContext();
	const navigate = useNavigate();

	const clickHandler = () => {
		(readyState !== ReadyState.OPEN) ? setDisplay(true) : navigate("/tournament");
	}

	return (
		<displayContext.Provider value={{display, setDisplay}}>
			<div className="grid grid-cols-1 sm:grid-cols-2 sm:h-[400px] bg-secondary rounded-md border-white">
				<div className="flex flex-col justify-between p-5 sm:p-10 space-y-8">
					<div className='space-y-8'>
						<div style={{textShadow: '0px 0 34px rgba(20,255,236,0.5)'}}>
							<Title
								firstCharClassName='text-4xl sm:text-5xl'
								restWordClassName="text-2xl sm:text-3xl md:text-4xl"
									>Tournament
							</Title>
						</div>
						<p>Join exciting ping pong tournaments, face skilled opponents, and rise up the leaderboard. Compete for the top spot and claim victory!</p>
					</div>
					<div onClick={clickHandler}>
						<Button className="h-full w-full max-w-[340px]">Join Tournament</Button>
					</div>
				</div>
				<div className="hidden sm:block grow shrink-0 bg-login bg-no-repeat bg-cover bg-top">
					<div className="w-full h-full bg-gradient-to-l from-transparent to-secondary"></div>
				</div>
			</div>
			<JoinTournament />
		</displayContext.Provider>
	)
}

export default Tournaments;