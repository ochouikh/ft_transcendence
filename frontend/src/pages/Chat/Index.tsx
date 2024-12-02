import { useEffect } from "react";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import Dashboard from "./Dashboard/Dashboard";
import Conversation from "./Conversation/Conversation";
import { AnimatePresence } from 'framer-motion'

function Index() {
	const { state, dispatch } = useChatContext();

	useEffect(() => {

		dispatch({type: CHAT_OPTS.FOCUS, state: window.innerWidth >= 1024})

		const resizeHandler = () => {
			dispatch({type: CHAT_OPTS.FOCUS, state: window.innerWidth >= 1024})
		}

		window.addEventListener('resize', resizeHandler)
	
		return () => {
			window.removeEventListener('resize', resizeHandler);
		}

	}, [])

	useEffect(() => {
		dispatch({type: CHAT_OPTS.UNREAD_CONVERSATION, status: false})
	}, [state.unreadConv])

	return (
		<div className="relative w-full h-[calc(100vh-10rem)] lg:flex shrink">
			<Dashboard />
			<AnimatePresence>
				<Conversation />
			</AnimatePresence>
		</div>
	)
}

export default Index;