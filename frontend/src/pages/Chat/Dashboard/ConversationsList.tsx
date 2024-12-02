import ConversationBar from "./ConversationBar";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import { Conversation } from "@/types/chat";
import { useEffect } from "react";

interface Props {
	className?: string
}

function ConversationsList({className, ...props}: Props) {
	const {state, dispatch} = useChatContext();

	const handler = (conversation: Conversation) => {
		dispatch({type: CHAT_OPTS.FOCUS, state: true})

		if (state.conversation.id == conversation.id) return;
	
		dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
			id: conversation.id,
			state: 'loading'
		}});
		dispatch({type: CHAT_OPTS.CONVERSATION_HEADER, conversation_header: {
			username: conversation.friend.username,
			avatar: conversation.friend.avatar_link,
			id: conversation.friend.id
		}})
	}

	useEffect(() => {
		dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
			id: null,
			state: null
		}})
	}, [])

	return ( 
		<div className="flex flex-col gap-[20px]" {...props}>
			{
				state.conversations.length != 0 && state.conversations.map((conv, index) => {
					return <ConversationBar onClick={() => handler(conv)} key={index} data={conv} />
				})
			}
			{
				state.conversations.length == 0 && 
				<div className="w-full flex flex-col items-center mt-5 font-light text-sm">
					You have no conversations
				</div>
			}
		</div>
	);
}

export default ConversationsList;