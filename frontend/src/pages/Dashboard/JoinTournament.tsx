import { AnimatePresence, motion } from "framer-motion";
import trophy from "/trophy.svg"
import Button from "@/components/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { displayContext } from "./Tournaments";
import { GiHumanPyramid } from "react-icons/gi";
import { useTournamentContext } from "@/contexts/TournamentProvider";
import { validate } from "@/utils/validation";
import { useAuthContext } from "@/contexts/authProvider";
import Modal from "@/components/Modal";
import Title from "@/components/Title";
import { WS_END_POINT } from "@/utils/urls";

function PlayersNum() {
	const { state, dispatch } = useTournamentContext();

	const clickHandler = (num: number) => {
		dispatch({type: "PLAYERS_NUM", playersNum: num});
	}

	return (
		<div className="flex items-center max-w-[344px] w-full h-[50px] bg-transparent">
			<div onClick={() => clickHandler(4)} className={"flex items-center justify-center grow h-full px-4 border border-border rounded-md cursor-pointer select-none " + ((state.playersNum === 4) ? "bg-border" : "")}>
				<span>4 players</span>
			</div>
				<GiHumanPyramid className="text-3xl px-1 grow"/>
			<div onClick={() => clickHandler(8)} className={"flex items-center justify-center grow h-full px-4 border border-border rounded-md cursor-pointer select-none " + ((state.playersNum === 8) ? "bg-border" : "")}>
				<span>8 players</span>
			</div>
		</div>
	);
}

function TournamentFrom() {
	const [validAlias, setValidAlias] = useState<boolean>(true);
	const inputRef = useRef<HTMLInputElement>(null);
	const { state: token }  = useAuthContext();
	const { state, dispatch } = useTournamentContext();

	const changeHandler = () => {
		(validate("username", inputRef.current ? inputRef.current.value : undefined)) ?
		setValidAlias(true)
		:
		setValidAlias(false);
		dispatch({type: "ALIAS", alias: inputRef.current ? inputRef.current.value : ''});
	}

	const clickHandler = () => {
		if (!validAlias || state.alias === '') return ;
		dispatch({type: "SOCKET_URL", socketUrl: WS_END_POINT + "game_tournament/" + state.playersNum + "/" + state.alias + "/?token=" + token.accessToken});
		// navigate("/Tournament");
	}

	useEffect(() => {
		if (inputRef)
			(inputRef.current) && (inputRef.current.value = state.alias);
	}, []);

	return (
		<div className="flex flex-col gap-8 items-center w-full">
			<div className="relative flex flex-col gap-4 items-center w-full">
				<input ref={inputRef} onChange={changeHandler} type="text" placeholder="Tournament’s  alias" className={"placeholder-[#858585] border rounded-md max-w-[344px] w-full h-[50px] px-4 bg-transparent outline-none duration-200 " + (validAlias ? "border-border" : "border-red-600") } />
				{
					!validAlias &&
					<span className="absolute top-0 left-[30%] bg-secondary px-1 -translate-x-1/2 -translate-y-1/2 text-red-600 text-xs">invalid alias</span>
				}
				<PlayersNum />
			</div>
			<div onClick={clickHandler} className="w-full flex justify-center">
				<Button className="w-full max-w-[344px]">Join</Button>
			</div>
		</div>
	);
}

function JoinTournament() {
	const display = useContext(displayContext);

	return (
		<Modal isOpen={display.display} onClose={() => display.setDisplay(false)}>
			<AnimatePresence>
			{
				display.display &&
				<motion.div
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{duration: 0.3}}
				exit={{ opacity: 0}}
				className="w-[90vw] max-w-[400px] p-5 sm:p-10 bg-secondary flex flex-col items-center gap-5 rounded-md">
					<img src={trophy} alt="TROPHY" className="w-[150px] h-[150px]"/>
					<Title
						className="mb-5 text-center"
						firstCharClassName="text-3xl" 
						restWordClassName="text-2xl">Join Tournament</Title>
					<TournamentFrom />
				</motion.div>
			}
			</AnimatePresence>
		</Modal>
	);
}

export default JoinTournament;