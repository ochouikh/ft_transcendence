import { useEffect } from "react";
import { Levels, usePingPongContext } from "@/contexts/pingPongProvider";
import Game from "./Game/Game";
import Result from "./Result/Result";
import { useNavigate } from "react-router-dom";
import { useTournamentContext } from "@/contexts/TournamentProvider";

function Index({isTournament}: {isTournament: boolean}) {
	const {state} = isTournament ? useTournamentContext() : usePingPongContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (state.level !== Levels.OpponentFound)
			navigate(isTournament ? '/tournament' : '/dashboard');
	}, []);

	return (
			<div className="flex justify-center items-center duration-300">
			{
				state.result.isEndGame
				?
				<Result isTournament={isTournament} />
				:
				<Game isTournament={isTournament} />
			}
			</div>
	);
}

export default Index;
