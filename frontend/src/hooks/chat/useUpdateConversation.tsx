import { useAuthContext } from "@/contexts/authProvider";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import { NOTIFICATION_OPTS, useNotificationsContext } from "@/contexts/notificationsProvider";
import { Conversation } from "@/types/chat";
import { useLocation } from "react-router-dom";

function useUpdateConversation() {
	const { state, dispatch } = useChatContext();
	const { dispatch: notDispatch } = useNotificationsContext();
	const { state: authState } = useAuthContext();
	const location = useLocation()

	const updateConversations = async (id: string | number | null, data: Conversation | null, type?: 'read') => {
	
		if (type == 'read') {
			for (let i = 0; i < state.conversations.length; i++) {
				const conv: Conversation = state.conversations[i];
				if (conv.id == state.conversation.id) {
					conv.status = true;
					break;
				}
				
			}
			dispatch({type: CHAT_OPTS.CONVERSATIONS, conversations: [...state.conversations]})
		}
		else {
			if (!data) return;
			const newArr = state.conversations.filter((conv: Conversation) => {
				return conv.id != id;
			})
			
			newArr.unshift(data);
			if (data.friend.username != state.conversation_header.username && data.sender != authState.username) {
				// in case of new message comes
				notDispatch({type: NOTIFICATION_OPTS.PUSH_NOTIFICATION, notification: {
					notification_id: undefined,
					type: "message",
					content: `new message from ${data.sender}`,
					read: false, 
					id: null,
					sender: data.sender
				}, dispatch: notDispatch})

				if (location.pathname != '/chat') {
					dispatch({type: CHAT_OPTS.UNREAD_CONVERSATION, status: true})
				}
			}
			dispatch({type: CHAT_OPTS.CONVERSATIONS, conversations: [...newArr]})
		}
	}

	return updateConversations;
}

export default useUpdateConversation;