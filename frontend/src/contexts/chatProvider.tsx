import { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer, useState } from "react";
import { useAuthContext } from "./authProvider";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { dateMeta } from "@/utils/global";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Modal from "@/components/Modal";
import { NOTIFICATION_OPTS, useNotificationsContext } from "./notificationsProvider";
import { WS_END_POINT } from "@/utils/urls";
import { useLocation } from "react-router-dom";
import { Conversation, ConversationState, Header, Message, OnlineFriend } from "@/types/chat";

export enum CHAT_OPTS  {
	FOCUS,
	MESSAGE,
	LAST_MESSAGE,
	CONVERSATION,
	CONVERSATION_HEADER,
	MESSAGES,
	ONLINE,
	CONVERSATIONS,
	SEARCH_CONVERSATIONS,
	UNREAD_CONVERSATION
}

export interface ChatStateProps {
	isFocus: boolean,
	messages: Message[],
	onlineFriends: OnlineFriend[],
	conversations: Conversation[],
	searchConversations: Conversation[],
	conversation: ConversationState
	conversation_header: Header
	lastMessage: Message | null
	newMessageTriggered: boolean
	unreadConv: boolean
}

const initialState: ChatStateProps = {
	isFocus: false,
	messages: [],
	onlineFriends: [],
	conversations: [],
	conversation: {
		id: null,
		state: null
	},
	searchConversations: [],
	conversation_header: {
		username: '',
		avatar: '',
		isOnline: false,
		id: ''
	},
	lastMessage: null,
	newMessageTriggered: false,
	unreadConv: false
};

export const ChatContext = createContext<{state: ChatStateProps, dispatch: Dispatch<any>, lastJsonMessage: any, sendJsonMessage: SendJsonMessage, readyState: ReadyState}>({
	state: initialState,
	dispatch: () => {},
	lastJsonMessage: '',
	sendJsonMessage: () => {},
	readyState: ReadyState.CLOSED
});

const reducer = (state: ChatStateProps, action: any) => {
	switch (action.type)
	{
		case CHAT_OPTS.FOCUS:
			if (action.state == true)
				return {
			 		...state, 
					isFocus: true
				}
			return { 
				...state, 
				isFocus: false
			}
		case CHAT_OPTS.MESSAGE:
			return { 
				...state,
				messages: [...state.messages, action.message],
				newMessageTriggered: !state.newMessageTriggered
			}
		case CHAT_OPTS.LAST_MESSAGE:
			return { 
				...state,
				lastMessage: action.message
			}
		case CHAT_OPTS.CONVERSATION:
			return { 
				...state, 
				conversation: action.conversation
			}
		case CHAT_OPTS.CONVERSATION_HEADER:
			return { 
				...state, 
				conversation_header: action.conversation_header
			}
		case CHAT_OPTS.MESSAGES:
			return { 
				...state, 
				messages: action.messages
			}
		case CHAT_OPTS.ONLINE:
			return { 
				...state, 
				onlineFriends: action.onlineFriends
			}
		case CHAT_OPTS.CONVERSATIONS:
			return { 
				...state, 
				conversations: action.conversations
			}
		case CHAT_OPTS.SEARCH_CONVERSATIONS:
			return { 
				...state, 
				searchConversations: action.conversations
			}
		case CHAT_OPTS.UNREAD_CONVERSATION:
			return { 
				...state, 
				unreadConv: action.status
			}
		default:
			return state;
	}
}

type updatedConv = {
	last_date: string
	last_message: string
	sender: string
	status: string
	friend: {
		avatar_link: string
		id: string | number
		is_online: boolean
		username: string
	}
}

type responseData = {
	id:	number | string
	username: string
	avatar_link: string
	is_online:	boolean
	conversation_id: number | string
}

const ChatContextProvider = ({children} : {children: ReactNode}) => {
	const [ state, dispatch ] = useReducer(reducer, initialState);
	const { state: authState } = useAuthContext();
	const [isReconnect, setIsReconnect] = useState(false);
	const { dispatch: notDispatch } = useNotificationsContext();
	const location = useLocation();

	function setErrorInLastMessage() {
		if (state.lastMessage != null) {
			const content = state.lastMessage.content;
			dispatch({type: CHAT_OPTS.LAST_MESSAGE, message: null});
			dispatch({type: CHAT_OPTS.MESSAGE, message: {
				content: content,
				date: dateMeta.getDate(),
				sender: authState.username,
				receiver: state.conversation_header.username,
				id: null,
				state: 'error'
			}});
		}
	}

	const {readyState, lastJsonMessage, sendJsonMessage} = useWebSocket(
		WS_END_POINT + "chat/?token=" + authState.accessToken,
		{
			onOpen: () => {
				setIsReconnect(false);
			},
			onClose: () => {
				setErrorInLastMessage();
			},
			onError: () => {
				setErrorInLastMessage()
			},
			retryOnError: false,
			shouldReconnect: () => {
				return true;
			},
			reconnectAttempts: 100,
			reconnectInterval: 3000,
			onReconnectStop: () => {
				setIsReconnect(false);
			}
		}
	  )

	  const updateConversations = async (id: string | number | null, data: updatedConv | null, type?: 'read') => {
	
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

	const updateFriendData = (data: responseData) => {
		// update conversations
		const conversations_update = state.conversations.map((conv: Conversation) => {
			if (conv.friend.id == data.id) {
				return { 
					...conv, 
					friend: {
						avatar_link: data.avatar_link,
						is_online: data.is_online,
						username: data.username,
						id: data.id
					}
				};
			}
			return conv;
		});
		dispatch({type: CHAT_OPTS.CONVERSATIONS, conversations: conversations_update});
		if (data.id == state.conversation_header.id) {
			dispatch({type: CHAT_OPTS.CONVERSATION_HEADER, conversation_header: {
				username: data.username,
				avatar: data.avatar_link,
				id: data.id
			}})
		}
	}

	useEffect(() => {
		if (lastJsonMessage) {
			console.log('new message')
			console.log(lastJsonMessage)
			if (lastJsonMessage.online) {
				dispatch({type: CHAT_OPTS.ONLINE, onlineFriends: lastJsonMessage.online})
			}
			if (lastJsonMessage.conversations) {
				const conv = lastJsonMessage.conversations.find((conv: Conversation) => conv.status == false && conv.sender != authState.username);
				dispatch({type: CHAT_OPTS.CONVERSATIONS, conversations: lastJsonMessage.conversations})
				dispatch({type: CHAT_OPTS.UNREAD_CONVERSATION, status: conv ? true : false})
			}
			if (lastJsonMessage.messages) {
				dispatch({type: CHAT_OPTS.MESSAGES, messages: [ ...lastJsonMessage.messages, ...state.messages ]})
				dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
					id: state.conversation.id,
					state: 'ok',
					limitReached: lastJsonMessage.messages.length != 10
				}})
				if (!lastJsonMessage.conversations) {
					// so it's not first time
					updateConversations(null, null, 'read')
				}
			}
			if (lastJsonMessage.type == 'message') {
				if (lastJsonMessage.receiver == authState.username) {
					// I'm the receiver
					if (lastJsonMessage.sender == state.conversation_header?.username) {
						// opened conversation
						dispatch({type: CHAT_OPTS.MESSAGE, message: {
							content: lastJsonMessage.message,
							date: dateMeta.getDate(),
							sender: state.conversation_header.username,
							receiver: authState.username,
							state: 'ok'
						}});
					}
					updateConversations(null, null, 'read')
					
				} else {
					// I'm the sender
					dispatch({type: CHAT_OPTS.LAST_MESSAGE, message: null});
					dispatch({type: CHAT_OPTS.MESSAGE, message: {
						content: lastJsonMessage.message,
						date: dateMeta.getDate(),
						sender: authState.username,
						receiver: state.conversation_header.username,
						state: 'ok'
					}});
				}
			}
			if (lastJsonMessage.type == 'conversation_update') {
				// const newArr = state.conversations.filter
				updateConversations(lastJsonMessage.data.id, lastJsonMessage.data);
			}
			if (lastJsonMessage.type == 'update_data') {
				// for update online users status
				let newList: OnlineFriend[] = [];
				const data: responseData = lastJsonMessage.data
				const isFound = state.onlineFriends.find((friend: OnlineFriend) => friend.id == data.id);
				if (!isFound) {
					newList = [...state.onlineFriends]
					if (data.is_online) {
						newList.push(data);
					}
				}
				else {
					// User already online
					// update online users
					newList = state.onlineFriends.filter((friend: OnlineFriend) => {
						if (friend.id == data.id) {
							friend = data;
							return data.is_online
						}
						return true
					})
				}
				updateFriendData(data);
				dispatch({type: CHAT_OPTS.ONLINE, onlineFriends: newList})
			}
			if (lastJsonMessage.type == 'getConversation') {
				dispatch({type: CHAT_OPTS.FOCUS, state: true})
				dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
					id: lastJsonMessage.id,
					state: 'loading'
				}});
				// sendJsonMessage({
				// 	type: 'messages',
				// 	conversation_id: lastJsonMessage.id,
				// 	user_id: authState.user_id
				// })
			}
			if (lastJsonMessage.type == 'update_after_accept_request') {
				// add to online friends
				const friend: OnlineFriend = {
					username: lastJsonMessage.online.username,
					avatar_link: lastJsonMessage.online.avatar_link,
					id: lastJsonMessage.online.id,
					is_online: lastJsonMessage.online.is_online,
					conversation_id: lastJsonMessage.conversation.id
				}
				const newList = [...state.onlineFriends, friend]
				dispatch({type: CHAT_OPTS.ONLINE, onlineFriends: newList})
			}
			if (lastJsonMessage.type == 'delete_data') {
				const newConvs = state.conversations.filter((conv: Conversation) => {
					return conv.id != lastJsonMessage.conversation
				})
				dispatch({type: CHAT_OPTS.CONVERSATIONS, conversations: [...newConvs]})
				const newFriends = state.onlineFriends.filter((friend: OnlineFriend) => {
					return friend.username != lastJsonMessage.user.username
				})
				dispatch({type: CHAT_OPTS.ONLINE, onlineFriends: newFriends})

				if (lastJsonMessage?.user?.username == state.conversation_header.username) {
					dispatch({type: CHAT_OPTS.FOCUS, state: false});
					dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
						id: null,
						state: null
					}})
				}
			}
			if (lastJsonMessage.error) {
				// trying to send message after unfriend
				dispatch({type: CHAT_OPTS.MESSAGE, message: {
					content: state.lastMessage.content,
					date: dateMeta.getDate(),
					sender: authState.username,
					receiver: state.conversation_header.username,
					id: null,
					state: 'error'
				}});
				dispatch({type: CHAT_OPTS.LAST_MESSAGE, message: null});
			}
		}
	}, [lastJsonMessage])

	useEffect(() => {
		if (state.conversation.state == 'loading') {
			dispatch({type: CHAT_OPTS.MESSAGES, messages: []})
			sendJsonMessage({
				type: 'messages',
				conversation_id: state.conversation.id,
				user_id: authState.user_id
			})
		}
	}, [state.conversation])

	useEffect(() => {
		if (location.pathname != '/chat') {
			dispatch({type: CHAT_OPTS.CONVERSATION_HEADER, conversation_header: {
				username: '',
				avatar: '',
			}})
		}
		if (!state.isFocus) {
			dispatch({type: CHAT_OPTS.LAST_MESSAGE, message: null})
			dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
				id: null,
				state: null
			}})
		}
	}, [state.isFocus, location.pathname])

	return (
		<ChatContext.Provider value={{state, dispatch, lastJsonMessage, sendJsonMessage, readyState}}>
			<>
				<Modal isOpen={isReconnect} onClose={() => {}} >
					<div className="flex gap-5 items-center bg-secondary px-10 p-5 rounded-md">
						<h1>Reconnecting</h1>
						<AiOutlineLoading3Quarters className='animate-spin' />
					</div>
				</Modal>
				{children}
			</>
		</ChatContext.Provider>
	)
}

export const useChatContext = () => useContext(ChatContext);
export default ChatContextProvider;