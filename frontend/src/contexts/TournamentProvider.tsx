import { Dispatch, ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { NOTIFICATION_OPTS, useNotificationsContext } from "./notificationsProvider";
import { Coordinates, Levels, score } from "./pingPongProvider";
import { UserData } from "@/types/profile";
import { useGlobalContext } from "./store";

export interface Player {
	username: string,
	image: string
}

export interface RoundData {
	round: number,
	players: Player[] | "player"[],
}

interface TournamentData {
	alias: string,
	opponentAlias: string,
	playersNum: number,
	roundData: RoundData[],
	winner: Player | "player",
	socketUrl: string | null,
	level: Levels,
	opponent: UserData | null,
	counter: number,
	status: string,
	ballData: Coordinates,
	myPaddleData: Coordinates,
	sidePaddleData: Coordinates,
	score: score,
	directions: {
		my: "right" | "left",
		side: "right" | "left",
	},
	result: {
		isEndGame: boolean,
		status: string,
		xp: number,
	},
	timer: number,
	time: number,
	timeResult: number,
}

const initialState: TournamentData = {
	alias: '',
	opponentAlias: '',
	playersNum: 4,
	roundData: [],
	winner: "player",
	socketUrl: null,
	level: Levels.UNINSTANTIATED,
	opponent: null,
	counter: 0,
	status: "ready",
	ballData: {
		x: 50,
		y: 50,
	},
	myPaddleData: {
		x: 1,
		y: 50,
	},
	sidePaddleData: {
		x: 97,
		y: 50,
	},
	score: {
		my: 0,
		side: 0,
	},
	directions: {
		my: "left",
		side: "right",
	},
	result: {
		isEndGame: false,
		status: '',
		xp: 0,
	},
	timer: 15,
	time: 0,
	timeResult: 5,
};

export enum TOURNAMENT_OPTS {
	ALIAS,
	OPPONENT_ALIAS,
	PLAYERS_NUM,
	ROUND_DATA,
	WINNER,
	SOCKET_URL,
	CHLEVEL,
	OPPONENT,
	COUNTER,
	STATUS,
	BALL_DATA,
	MY_PADDLE_DATA,
	SIDE_PADDLE_DATA,
	SCORE,
	DIRECTIONS,
	IS_END_GAME,
	RESULT,
	CUSTOM,
	TIMER,
	TIME_RESULT,
	RESET_BETA,
	RESET
}

export const TournamentContext = createContext<{lastJsonMessage: any, sendJsonMessage: SendJsonMessage, readyState: ReadyState, state: TournamentData, dispatch: Dispatch<any>}>({
	lastJsonMessage: '',
	sendJsonMessage: () => {
	},
	readyState: ReadyState.UNINSTANTIATED,
	state: initialState,
	dispatch: () => {}
});

const reducer = (state: TournamentData, action: any) => {
	switch (action.type)
	{
		case 'ALIAS':
			return {
				...state,
				alias: action.alias
			}
		case 'OPPONENT_ALIAS':
			return {
				...state,
				opponentAlias: action.opponentAlias
			}
		case 'PLAYERS_NUM':
			return {
				...state,
				playersNum: action.playersNum
			}
		case 'ROUND_DATA':
			return {
				...state,
				roundData: action.roundData
			}
		case 'WINNER':
			return {
				...state,
				winner: action.winner
			}
		case 'SOCKET_URL':
			return {
				...state,
				socketUrl: action.socketUrl
			}
		case 'CHLEVEL':
			return {
				...state,
				level: action.level
			}
		case 'OPPONENT':
			return {
				...state,
				opponent: action.opponent
			}
		case 'COUNTER':
			return { 
				...state, 
				counter: action.counter
			}
		case 'STATUS':
			return { 
				...state, 
				status: action.status
			}
		case 'ball_Data':
			return { 
				...state, 
				ballData: action.ballData
			}
		case 'my_Paddle_Data':
			return { 
				...state, 
				myPaddleData: action.myPaddleData
			}
		case 'side_Paddle_Data':
			return { 
				...state, 
				sidePaddleData: action.sidePaddleData
			}
		case 'SCORE':
			return { 
				...state, 
				score: action.score
			}
		case 'DIRECTIONS':
			return { 
				...state, 
				directions: action.directions
			}
		case 'is_end_game':
			return { 
				...state, 
				isEndGame: action.isEndGame
			}
		case 'RESULT':
			return { 
				...state, 
				result: action.result
			}
		case 'CUSTOM':
			return { 
				...state, 
				custom: action.custom
			}
		case 'TIMER':
			return { 
				...state, 
				timer: action.timer
			}
		case 'TIME_RESULT':
			return { 
				...state, 
				timeResult: action.timeResult
			}
		case 'RESET_BETA':
			return {
				...state,
				level: Levels.FindingOpponent,
				opponent: null,
				status: "ready",
				ballData: {
					x: 50,
					y: 50,
				},
				myPaddleData: {
					x: 1,
					y: 50,
				},
				sidePaddleData: {
					x: 97,
					y: 50,
				},
				score: {
					my: 0,
					side: 0,
				},
				directions: {
					my: "left",
					side: "right",
				},
				result: {
					isEndGame: false,
					status: '',
					xp: 0,
				},
				timer: 15,
				timeResult: 5,
		}
		case 'RESET':
			return initialState
		default:
			return state;
	}
}

const TournamentContextProvider = ({children} : {children: ReactNode}) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const navigate = useNavigate();
	const { dispatch: notDispatch } = useNotificationsContext();
	const { state: profileData } = useGlobalContext();
	const username: string | undefined = profileData.userData?.username;

	const initRounds = useCallback((): RoundData[] => {
		const resetRoundData: RoundData[] = [];
		let roundsNum = 0;
		let i: number = state.playersNum / 2;
		while (i >= 1) {
			roundsNum++;
			i = i / 2;
		}
		i = 0;
		let j = state.playersNum;
		while (i < roundsNum)
		{
			const tmp: RoundData = {
				round: j,
				players: []
			};
			const play: any = [];
			let k = j;
			while (k > 0)
			{
				play.push('player');
				k--;
			};
			tmp.players = play;
			resetRoundData.push(tmp);
			j = j / 2;
			i++;
		}
		return resetRoundData;
	}, [state.playersNum])

	const {lastJsonMessage, sendJsonMessage, readyState } = useWebSocket(state.socketUrl,
		{
			onOpen: () => {
				dispatch({type: "ROUND_DATA", roundData: initRounds()});
				dispatch({type: "WINNER", winner: "player"});
				navigate("/tournament");
			},
			onClose: () => {
				dispatch({ type: "RESET" });
				// navigate("/dashboard");
			},
			onError: () => {
				// navigate("/dashboard");
			},
			share: false,
			shouldReconnect: () => false,
		},
		state.socketUrl !== null
	);

	const isEmptyObject = (obj: any) => {
		if (obj === null)
			return (true);
		return JSON.stringify(obj) === '{}';
	};

	const messageHandler = (message: any) => {
		if (message.type == "opponents")
		{
			if (message.user1.username == username)
			{
				dispatch({type: "OPPONENT", opponent: message.user2});
				dispatch({type: "OPPONENT_ALIAS", opponentAlias: message.user2.alias});
			}
			else
			{
				dispatch({type: "OPPONENT", opponent: message.user1});
				dispatch({type: "OPPONENT_ALIAS", opponentAlias: message.user1.alias});
			}
			dispatch({type: 'CHLEVEL', level: Levels.OpponentFound});
		}
		else if (message.type == "timing1")
		{
			(message.time == 5) && dispatch({ type: "RESET_BETA" });
			message.time > 1 && notDispatch({type: NOTIFICATION_OPTS.PUSH_NOTIFICATION, notification: { type: 'text', content: "your next match in tournament will starts in a few seconds..." }, dispatch: notDispatch});
		}
		else if (message.type == "timing2")
		{
			dispatch({type: "TIMER", timer: message.time});
			(message.time == 14) && navigate('/tournament/match-making');
		}
		else if (message.type == "timingend")
		{
			(message.time == 5) && dispatch({type: "RESULT", result: {...state.result, isEndGame: true}});
			dispatch({type: "TIME_RESULT", timeResult: message.time});
		}
		else if (message.type == "init_paddle")
		{
			(message.my == 1) ?
			dispatch({type: "DIRECTIONS", directions: {...state.directions, my: "left", side: "right"}})
			:
			dispatch({type: "DIRECTIONS", directions: {...state.directions, my: "right", side: "left"}});

			dispatch({type: "my_Paddle_Data", myPaddleData: {...state.myPaddleData, x: message.my}});
			dispatch({type: "side_Paddle_Data", sidePaddleData: {...state.sidePaddleData, x: message.side}});
			dispatch({type: "TIMER", timer: -1});
		}
		else if (message.type == "ball")
		{
			const ballData: Coordinates = {
				x: message.x,
				y: message.y
			}
			dispatch({type: "ball_Data", ballData: ballData});
		}
		else if (message.type == "myPaddle")
		{
			dispatch({type: "my_Paddle_Data", myPaddleData: {...state.myPaddleData, y: message.pos}});
		}
		else if (message.type == "sidePaddle")
		{
			dispatch({type: "side_Paddle_Data", sidePaddleData: {...state.sidePaddleData, y: message.pos}});
		}
		else if (message.type == "score")
		{
			(state.directions.my == "right") ?
			dispatch({type: "SCORE", score: {...state.score, my: message.right, side: message.left}})
			:
			dispatch({type: "SCORE", score: {...state.score, my: message.left, side: message.right}});
		}
		else if (message.type == "end")
		{
			// dispatch({ type: "RESET_BETA" });
			dispatch({type: "RESULT", result: {...state.result, status: message.status, xp: 0, isEndGame: true}});
		}
	}

	useEffect(() => {

		if (!isEmptyObject(lastJsonMessage))
		{

			if (lastJsonMessage.type == "dashboard")
			{
				const isCompleted: boolean = (lastJsonMessage.rounds.length > state.roundData.length);
				const roundData: RoundData[] = initRounds();
				lastJsonMessage.rounds.map((round: any, key: number) => {
					for (var player in round) {
						const convertIndex = parseFloat(player);
						const index = key === 0 ? convertIndex : (key === 1 ? Math.ceil(convertIndex / 2) : Math.ceil(convertIndex / 4));
						const tmp: Player = {
							username: round[player][0],
							image: round[player][1]
						};
						if (isCompleted)
						{
							(key == lastJsonMessage.rounds.length - 1) ? dispatch({type: "WINNER", winner: tmp}) : roundData[key].players[index - 1] = tmp;
						}
						else
							roundData[key].players[index - 1] = tmp;
					}
				});
				dispatch({type: "ROUND_DATA", roundData: roundData});
			}
			else
				messageHandler(lastJsonMessage);
		}
		
	}, [lastJsonMessage]);

	return (
		<TournamentContext.Provider value={{lastJsonMessage, sendJsonMessage, readyState, state, dispatch}}>
			{children}
		</TournamentContext.Provider>
	)
}

export const useTournamentContext = () => useContext(TournamentContext);
export default TournamentContextProvider;
