import Game from "./Game/Game";
import Result from "./Result/Result";
import { useEffect, useRef, useState } from "react";
import { Enum, GameLogic } from "./Logic";
import { useTimer } from "react-timer-hook";
import { useGlobalContext } from "@/contexts/store";

function Index({isAI}: {isAI: boolean}) {
	const [isEndGame, setIsEndGame] = useState<boolean>(false);
	const [counter, setCounter] = useState<number>(3);
	const [status, setStatus] = useState<"ready" | "help">("ready");
	const animationRef: any = useRef();
    const lastTime: any = useRef<FrameRequestCallback>();
	const game = useRef<any>(null);
	const rightPaddle = useRef<HTMLDivElement>(null);
	const leftPaddle = useRef<HTMLDivElement>(null);
	const [rightScore, setRightScore] = useState<number>(0);
	const [leftScore, setLeftScore] = useState<number>(0);
	const ball = useRef<HTMLDivElement>(null);
	const rightMoves = useRef< -1 | 0 | 1 >(0);
	const leftMoves = useRef< -1 | 0 | 1 >(0);
	const { state } = useGlobalContext();
	const difficulty: Enum = state.localGameData.difficulty === "easy" ? Enum.EASY : (state.localGameData.difficulty === "medium" ? Enum.MEDIUM : Enum.HARD)

	const time = new Date();
	time.setSeconds(time.getSeconds() + (state.localGameData.time * 60));
	const { seconds, minutes, isRunning, start } = useTimer({ expiryTimestamp: time, autoStart: false });

	const loop_hook = (time: number) => {
        if (lastTime.current != undefined) {
            const delta: number = time - lastTime.current
			if (rightMoves.current !== 0)
				game.current.rightPaddle.update(rightMoves.current);
			if (!isAI && leftMoves.current !== 0)
				game.current.leftPaddle.update(leftMoves.current);
			isAI ? game.current.updateAIGame(delta) : game.current.updateGame(delta);
			(rightScore != game.current.rightScore) && setRightScore(game.current.rightScore);
			(leftScore != game.current.leftScore) && setLeftScore(game.current.leftScore);
            if (game.current.rightScore >= state.localGameData.goals || game.current.leftScore >= state.localGameData.goals)
			{
				cancelAnimationFrame(animationRef.current);
				setIsEndGame(true);
				return ;
			}
        }
        lastTime.current = time
        animationRef.current = requestAnimationFrame(loop_hook);
    }

	useEffect(() => {
		if (!isRunning && counter == 0) {
			cancelAnimationFrame(animationRef.current);
			setIsEndGame(true);
		}
		
	}, [isRunning]);

	useEffect(() => {
		if ((counter == 0) && (status == "ready") && (!animationRef.current))
		{
			game.current = isAI ?
			new GameLogic(ball.current, rightPaddle.current, leftPaddle.current, difficulty)
			:
			new GameLogic(ball.current, rightPaddle.current, leftPaddle.current);
			animationRef.current = requestAnimationFrame(loop_hook);
		}
		if (status == "ready") if (counter == 0) start();
	}, [counter]);

	return (
			<div className="flex justify-center items-center duration-300">
				{
					isEndGame
					?
					<Result isAI={isAI} leftScore={leftScore} rightScore={rightScore} />
					:
					<Game isAI={isAI} rightMoves={rightMoves} leftMoves={leftMoves} ref={ball} status={status} setStatus={setStatus} counter={counter} setCounter={setCounter} gameLogic={game} leftPaddle={leftPaddle} leftScore={leftScore} rightPaddle={rightPaddle} rightScore={rightScore} minutes={minutes} seconds={seconds} />
				}
			</div>
	);
}

export default Index;