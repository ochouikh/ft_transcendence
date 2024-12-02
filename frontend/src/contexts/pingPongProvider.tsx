import { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer } from "react";
import { STORE_OPTS, useGlobalContext } from "./store";
import { useNavigate } from "react-router-dom";
import { UserData } from "@/types/profile";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { useAuthContext } from "./authProvider";
import useWebSocket from "react-use-websocket";
import { WS_END_POINT } from "@/utils/urls";

export interface Coordinates {
	x: number,
	y: number,
}

export interface score {
	my: number,
	side: number,
}

export enum Levels {
	UNINSTANTIATED,
	FindingOpponent,
	OpponentFound,
}

export interface GameData {
	alias: string,
	opponentAlias: string,
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

const initialState: GameData = {
	alias: '',
	opponentAlias: '',
	level: Levels.FindingOpponent,
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

export const PingPongContext = createContext<{ state: GameData, dispatch: Dispatch<any>, lastJsonMessage: any, sendJsonMessage: SendJsonMessage}>({
	state: initialState,
	dispatch: () => {},
	lastJsonMessage: '',
	sendJsonMessage: () => {
	}
});

const reducer = (state: GameData, action: any) => {
	switch (action.type)
	{
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
			case 'TIME':
				return { 
					...state, 
					time: action.time
				}
			case 'ALIAS':
				return { 
					...state, 
					alias: action.alias
				}
			case 'RESET':
				return initialState;
		default:
			return state;
	}
}

const PingPongContextProvider = ({children} : {children: ReactNode}) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const { state: profileData, dispatch: dispatchGlobal } = useGlobalContext();
	const username: string | undefined = profileData.userData?.username;
	const navigate = useNavigate();

	const { state: token }  = useAuthContext();
	const { state: stateGlobal } = useGlobalContext();

	const fullWsUrl: string = stateGlobal.gameId ? "game/" + stateGlobal.gameId + "/?token=" : "game/" + "random/?token=";
	const { lastJsonMessage, sendJsonMessage } = useWebSocket(WS_END_POINT + fullWsUrl + token.accessToken,
		{
			onClose: () => dispatch({ type: "RESET" }),
			share: false,
			shouldReconnect: () => false,
		}
	);

	const isEmptyObject = (obj: any) => {
		if (obj === null)
			return (true);
		return JSON.stringify(obj) === '{}';
	};

	const messageHandler = (message: any) => {
		// if (message.type != "ball" && message.type != "paddle")
		if (message.type == "opponents")
		{
			if (message.user1.username == username)
			{
				dispatch({type: "OPPONENT", opponent: message.user2});
			}
			else
			{
				dispatch({type: "OPPONENT", opponent: message.user1});
			}
			dispatch({type: 'CHLEVEL', level: Levels.OpponentFound});
		}
		else if (message.type == "timing2")
		{
			dispatch({type: "TIMER", timer: message.time});
		}
		else if (message.type == "ingame")
		{
			dispatchGlobal({type: STORE_OPTS.ALERT, message: "you are already in game!!", isError: true, dispatch: dispatchGlobal})
			navigate('/ping-pong');
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
			dispatch({type: 'CHLEVEL', level: Levels.FindingOpponent});
		}
		else if (message.type == "ball")
		{
			const ballData: Coordinates = {
				x: message.x,
				y: message.y
			}
			dispatch({type: "ball_Data", ballData: ballData});
			dispatch({type: "TIME", time: message.time});
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
			dispatch({type: "RESULT", result: {...state.result, status: message.status, xp: message.xp, isEndGame: true}});
		}
		else if (message.type == "disconnect")
		{
			message.status == "win"
			?
			dispatch({type: "SCORE", score: {...state.score, my: 3, side: 0}})
			:
			dispatch({type: "SCORE", score: {...state.score, my: 0, side: 3}});
			dispatch({type: "RESULT", result: {...state.result, status: message.status, xp:  message.xp, isEndGame: true}});
		}
	}

	useEffect(() => {
		if (!isEmptyObject(lastJsonMessage))
			messageHandler(lastJsonMessage);
		
	}, [lastJsonMessage]);
	
	return (
		<PingPongContext.Provider value={{state, dispatch, lastJsonMessage, sendJsonMessage}}>
			{children}
		</PingPongContext.Provider>
	)
}

export const usePingPongContext = () => useContext(PingPongContext);
export default PingPongContextProvider;