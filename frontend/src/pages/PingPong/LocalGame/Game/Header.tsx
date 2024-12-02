import help from "/Help_icon.svg"
import { Dispatch, SetStateAction } from "react";
import { useGlobalContext } from "@/contexts/store";

interface Props {
	rightScore: number,
	leftScore: number,
	minutes: number,
	seconds: number,
	counter: number,
	setCounter: Dispatch<SetStateAction<number>>,
	status: "ready" | "help",
	setStatus: Dispatch<SetStateAction<"ready" | "help">>,
	isAI: boolean,
}

const Header = (props: Props) => {
	const { state } = useGlobalContext();

	const clickHandler = () => {
		if (props.counter > 0)
			return ;
		props.setStatus("help");
		props.setCounter(2);
	}

	return (
		<div className="w-full gap-1 flex items-center justify-between">
			<div className="flex gap-1">
				<div className="relative bg-secondary w-[40px] h-[40px] shrink-0">
					<div className="absolute w-[2px] top-full -translate-y-full bg-white max-h-full duration-300" style={{height: `${props.leftScore * 100 / state.localGameData.goals}%`}}/>
					<span className="absolute inline-flex items-center justify-center w-full h-full">{props.leftScore}</span>
				</div>
				<div className="relative bg-secondary w-[40px] h-[40px] shrink-0">
					<div className={"absolute w-[2px] top-full -translate-y-full max-h-full duration-300 " + (props.isAI ? 'bg-primary' : 'bg-white')} style={{height: `${props.rightScore * 100 / state.localGameData.goals}%`}}/>
					<span className={"absolute inline-flex items-center justify-center w-full h-full " + (props.isAI ? 'text-primary' : '')}>{props.rightScore}</span>
				</div>
			</div>
			<div className="flex gap-1 shrink-0 justify-self-end">
				<div className="bg-secondary px-1 h-[40px] w-[61px] flex justify-center items-center">
					<span className="w-[44px]">
						{String(props.minutes).padStart(2, '0')}
						:
						{String(props.seconds).padStart(2, '0')}
					</span>
				</div>
				<div onClick={clickHandler} className="bg-secondary w-[40px] h-[40px] flex justify-center items-center">
					<img src={help} alt="HELP" />
				</div>
			</div>
		</div>
	)
}

export default Header;