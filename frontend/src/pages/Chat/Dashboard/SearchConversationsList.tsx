import { ComponentProps } from "react";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import ConversationBar from "./ConversationBar";
import { Conversation } from "@/types/chat";

interface Props extends ComponentProps<'div'> {
	input: string
}

function SearchConversationsList({input, ...props}: Props) {
	const { state, dispatch } = useChatContext();
	
	const handler = (conversation: Conversation) => {
		dispatch({type: CHAT_OPTS.FOCUS, state: true})
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
	
	return ( 
		<div {...props}>
			{input != "" && <h1 className="mb-5">result for search "{input}"</h1>}
			<div className="space-y-[20px]">
				{
					state.searchConversations.map((conv, index) => {
						return (
							<ConversationBar onClick={() => handler(conv)} key={index} data={conv} />
						)
					})
				}
			</div>
		</div>
	);
}

export default SearchConversationsList;