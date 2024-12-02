import help from "/Help_icon.svg"
import { usePingPongContext } from "@/contexts/pingPongProvider";
import { useTournamentContext } from "@/contexts/TournamentProvider";

const timeConverter = (time: number) => {
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	const finalSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();
	const finalMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
	return { finalMinutes, finalSeconds }
}

const Header = ({isTournament}: {isTournament: boolean}) => {
	const {state, dispatch} = isTournament ? useTournamentContext() : usePingPongContext();
	const { finalMinutes, finalSeconds } = timeConverter(state.time);

	const clickHandler = () => {
		if (state.counter > 0 || state.timer > 0)
			return ;
		dispatch({type: "COUNTER", counter: 2});
	}

	return (
		<div className="w-full gap-1 items-center grid grid-cols-3 grid-rows-2 lg:grid-rows-1">
			<div className="flex col-start-1 col-end-2 ">
				<div className={"flex gap-1 " + ((state.directions.my == "right") ? "flex-row-reverse" : "flex-row")}>
					<div className="relative bg-secondary w-[40px] h-[40px] shrink-0">
						<div className="absolute w-[2px] top-full -translate-y-full bg-primary max-h-full duration-300" style={{height: `${state.score.my * 10}%`}}/>
						<span className="absolute inline-flex items-center justify-center text-primary w-full h-full">{state.score.my}</span>
					</div>
					<div className="relative bg-secondary w-[40px] h-[40px] shrink-0">
						<div className="absolute w-[2px] top-full -translate-y-full bg-white max-h-full duration-300" style={{height: `${state.score.side * 10}%`}}/>
						<span className="absolute inline-flex items-center justify-center w-full h-full">{state.score.side}</span>
					</div>
					<div className="bg-secondary lg:w-full lg:max-w-[133px] h-[40px] flex md:justify-start justify-center items-center px-2 shrink-0 sm:shrink">
						<img src={state.opponent?.profile_image} alt="PROFILE_IMG" className="w-[26px] h-[26px] border rounded-full overflow-hidden shrink-0"/>
						<span className="shrink truncate text-xs hidden sm:block pl-3">{isTournament ? state.opponentAlias : state.opponent?.username}</span>
					</div>
				</div>
			</div>
			<div className="flex gap-1 shrink-0 justify-self-end col-start-3 col-end-4">
				{
					!isTournament &&
					<div className="bg-secondary px-1 h-[40px] w-[61px] flex justify-center items-center">
						<span className="w-[44px] text-center">
							{finalMinutes}
							:
							{finalSeconds}
						</span>
					</div>
				}
				<div onClick={clickHandler} className="bg-secondary w-[40px] h-[40px] flex justify-center items-center">
					<img src={help} alt="HELP" />
				</div>
			</div>
		</div>
	)
}

export default Header;