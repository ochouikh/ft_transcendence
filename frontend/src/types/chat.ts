type Url = string;
type Username = string;

export interface Header {
	username: Username
	avatar: Url
	isOnline: boolean
	id: string | number
}

export interface Conversation {
	friend: {
		id: string | number
		username: Username
		avatar_link: Url
		online: boolean
	}
	id: string | number
	last_date: string
	last_message: string
	sender: Username
	status: boolean
}

export interface OnlineFriend {
	id: string | number
	avatar_link: Url
	conversation_id: string | number
	username: Username
	is_online?: boolean
}

export interface Message {
	content:  string
	date: string
	id: number
	receiver: string
	sender: string
	state?: 'processing' | 'ok' | 'error'
}

export interface ConversationState {
	id: string | number | null,
	state: null | 'loading' | 'ok'
	limitReached?: boolean
};