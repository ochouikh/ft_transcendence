import {AnimatePresence, motion} from 'framer-motion'
import ConversationHeader from "./ConversationHeader";
import { FormEvent, InputHTMLAttributes, MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import ConversationMessages from './ConversationMessages';
import { CHAT_OPTS, useChatContext } from '@/contexts/chatProvider';
import { useAuthContext } from '@/contexts/authProvider';
import { ReadyState } from 'react-use-websocket';
import { isEmpty } from '@/utils/validation';
import { dateMeta } from '@/utils/global';
import { STORE_OPTS, useGlobalContext } from '@/contexts/store';
import chatBotLottie from '@/assets/chatBotLottie.json'
import Lottie from 'lottie-react'
import Title from '@/components/Title';
import './index.css'

function Conversation() {
	const { state, dispatch, sendJsonMessage, readyState } = useChatContext();
	const [message, setMessage] = useState('');
	const { state: authState } = useAuthContext();
	const { dispatch: gDispatch } = useGlobalContext();
	const [isVisible, setIsVisible] = useState(() => window.innerWidth >= 1024);
	const messageInput = useRef<HTMLInputElement>(null);
	const msgsContainer = useRef<HTMLDivElement>(null);

	const sendMessage = async (e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (isEmpty(message)) {
			return;
		}

		if (message.length > 500) {
			gDispatch({type: STORE_OPTS.ALERT, isError: true, message: "Can't send more than 500 characters", dispatch: gDispatch})
			return;
		}
		const message_content = message;
		setMessage('');
		((e.target as HTMLElement).firstChild as InputHTMLAttributes<HTMLInputElement>).value = '';
		const ServerMessage = {
			id: state.conversation.id,
			type: 'send_message',
			message: message_content,
			sender: authState.username,
			receiver: state.conversation_header.username,
		}
		dispatch({type: CHAT_OPTS.LAST_MESSAGE, message: {
			content: message_content,
			date: dateMeta.getDate(),
			sender: authState.username,
			receiver: state.conversation_header.username,
			id: null,
			state: 'processing'
		}});
		
		setTimeout(() => {
			if (readyState == ReadyState.OPEN) {
				sendJsonMessage(ServerMessage);
			}
			if (readyState != ReadyState.OPEN) {
				dispatch({type: CHAT_OPTS.LAST_MESSAGE, message: null});
			
				// if error
				dispatch({type: CHAT_OPTS.MESSAGE, message: {
					content: message_content,
					date: dateMeta.getDate(),
					sender: authState.username,
					receiver: state.conversation_header.username,
					id: null,
					state: 'error'
				}});
			}
		}, 300)
	}

	useLayoutEffect(() => {
		dispatch({type: CHAT_OPTS.FOCUS, state: window.innerWidth >= 1024})

		const resizeHandler = () => {
			dispatch({type: CHAT_OPTS.FOCUS, state: false})
		}

		window.addEventListener('resize', resizeHandler)
		return () => {
			window.removeEventListener('resize', resizeHandler);
		}
	}, [])

	useLayoutEffect(() => {
		if (state.isFocus) {
			setIsVisible(true);
		} else {
			if (window.innerWidth >= 1024) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		}
	}, [state.isFocus])

	useEffect(() => {
		if (state.lastMessage) {
			if (msgsContainer.current) {
				msgsContainer.current.style.scrollBehavior = 'smooth';
				msgsContainer.current.scrollTo(0, msgsContainer.current.scrollHeight);
				msgsContainer.current.style.scrollBehavior = '';
			}
			if (state.lastMessage.state != 'processing') {
				messageInput.current && messageInput.current.focus();
			}
		} else {
			messageInput.current && messageInput.current.focus();
		}
	}, [state.lastMessage])

	return ( 
		<AnimatePresence>
			{isVisible && 
			<motion.div
				initial={{x: '100%'}}
				animate={{x: 0}}
				exit={{x: '100%'}}
				transition={{
					duration: 0.3,
					ease: 'easeInOut'
				}}
				className="w-full h-full flex flex-col fixed top-0 left-0 lg:static z-10 bg-secondary">
				{!state.conversation.state &&
					<div className='h-full flex justify-center items-center py-10'>
						<div className='flex flex-col gap-5 items-center'>
							<Lottie
								animationData={chatBotLottie}
								className='chat-bot w-3/4 sm:w-52 2xl:w-96'
							/>
							{/* <img src={chatGif} className='w-3/4 sm:w-52 2xl:w-96' /> */}
							<Title firstCharClassName='text-2xl text-primary' restWordClassName='text-primary'>Chat</Title>
							<p className='text-gray1'>Welcome to your chat space</p>
						</div>
					</div>
				}
				{state.conversation.state && <>
					<ConversationHeader />
					<div ref={msgsContainer} className="messages-container grow flex flex-col bg-secondary overflow-auto p-5">
						<ConversationMessages parent={msgsContainer.current} />
					</div>
					<form onSubmit={(e) => sendMessage(e)} className="w-full flex gap-3 items-center px-5 h-[70px] bg-secondary shrink-0">
						<input
							ref={messageInput}
							disabled={state.lastMessage?.state == 'processing'} 
							className="h-[45px] px-3 grow border rounded-tr-none rounded-md bg-bg border-border focus:outline-none" 
							placeholder={state.lastMessage == null ? "try/silent...🤫" : 'sending...'} 
							onChange={(e) => setMessage(e.target.value)} 
							type="text" name="" id="" />
						<button
							disabled={state.lastMessage?.state == 'processing'}
							className={"shrink-0 px-5 bg-bg border rounded-md rounded-tl-none h-[45px] " + (state.lastMessage?.state == 'processing' ? 'border-gray2 text-gray2' : 'border-primary text-primary')} 
							type="submit">send</button>
					</form>
				</>}
			</motion.div>}
		</AnimatePresence>
	);
}

export default Conversation;