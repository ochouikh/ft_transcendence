import { useEffect, useRef } from "react";
import { useChatContext } from "@/contexts/chatProvider";
import Message from "./Message";
import { useAuthContext } from "@/contexts/authProvider";
import Observer from "../Dashboard/Observer";

interface Props {
	parent: HTMLDivElement | null
}

function ConversationMessages({parent}: Props) {
	const { state } = useChatContext();
	const { state: authState } = useAuthContext();
	const lastDate = useRef<string | null>(null);

	const scrollToBottom = (elem: Element) => {
		elem.scrollTo(0, elem.scrollHeight)
	}

	useEffect(() => {
		if (state.conversation.state == 'ok') {
			if (parent) {
				scrollToBottom(parent)
			}
		}
	}, [state.conversation.state])

	useEffect(() => {
		if (parent) {
			scrollToBottom(parent)
		}
	}, [state.newMessageTriggered])

	return ( 
		<div className="conv-msgs flex flex-col gap-8">
			{
				state.conversation.state == 'ok' &&
				<>
					<Observer />
					{
						state.messages.map((message, index) => {
							return <Message 
							state={message.state} 
							key={index} 
							type={message.sender == authState.username ? 'sent' : 'arrive' } 
							date={message.date}
							lastDate={lastDate}
							>
									{message.content}
								</Message>
						})
					}
					{
						state.lastMessage &&
						<Message 
								state={state.lastMessage.state}
								type={state.lastMessage.sender == authState.username ? 'sent' : 'arrive' } 
								date={state.lastMessage.date}
								lastDate={lastDate}
								className="animate-msg"
								>
									{state.lastMessage.content}
							</Message>
					}
				</>
			}
			{
				state.conversation.state == 'loading' && <h1>loading messages...</h1>
			}
		</div>
	);
}

export default ConversationMessages;