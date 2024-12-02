import { useEffect, useLayoutEffect, useRef } from "react";
import { useChatContext } from "@/contexts/chatProvider";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuthContext } from "@/contexts/authProvider";
import Lottie from "lottie-react";
import chatBotLottie from '@/assets/chatBotLottie.json'

function Observer() {
	const { state, sendJsonMessage } = useChatContext();
	const { state: authState } = useAuthContext();
	const container = useRef(null);
	const convId = useRef<number | string | null>(null);
	const firstMsgId = useRef<number | string | null>(null);
	const oldHeight = useRef(0);
	const oldScrollTop = useRef(0);

	useEffect(() => {
		convId.current = state.conversation.id
		firstMsgId.current = state.messages[0]?.id;
	}, [state.conversation, state.messages])

	const callback = ((entries: IntersectionObserverEntry[]) => {
		const element = entries[0];
		if (element.isIntersecting) {
			const parent = document.querySelector('.messages-container');
			if (!container.current || !parent) return;
			oldHeight.current = parent.scrollHeight;
			oldScrollTop.current = parent.scrollTop;
			sendJsonMessage({
				type: 'messages',
				limit: 10,
				conversation_id: convId.current,
				message_id: firstMsgId.current,
				user_id: authState.user_id
			})
		}
	})
	
	useEffect(() => {
		if (!container.current) return;

		const obs = new IntersectionObserver(callback, {
			threshold: 0
		});
		obs.observe(container.current)
	
		return () => {
			if (!container.current) return;
			obs.unobserve(container.current);
		}
	}, [])

	useLayoutEffect(() => {
		const parent = document.querySelector('.messages-container');
		if (!container.current || !parent) return;
		parent.scrollTop = parent.scrollHeight - oldHeight.current + oldScrollTop.current;
	}, [state.messages])

	return (
		<>
			{!state.conversation.limitReached && <div
				ref={container} className="h-[40px] flex justify-center items-center">
				<AiOutlineLoading3Quarters className='animate-spin' />
			</div>}
			{state.conversation.limitReached && 
				<div className="flex flex-col gap-10 justify-center items-center my-24">
					<Lottie
						animationData={chatBotLottie}
						className='chat-bot w-1/2 max-w-52'
						/>
					<h1 className="font-light text-gray1">Your conversation started here</h1>
				</div>
			}
		</>
	);
}

export default Observer;