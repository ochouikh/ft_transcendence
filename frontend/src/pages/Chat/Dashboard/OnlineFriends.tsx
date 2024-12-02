import User from "@/components/User";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";

function OnlineFriends() {
	const { state, dispatch } = useChatContext()

	const clickHandler = (friend: Object & { id: string | number, username: string, avatar_link: string, conversation_id: string | number }) => {
		dispatch({type: CHAT_OPTS.FOCUS, state: true})

		if (state.conversation.id == friend.conversation_id) return;
	
		dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
			id: friend.conversation_id,
			state: 'loading'
		}});
		dispatch({type: CHAT_OPTS.CONVERSATION_HEADER, conversation_header: {
			username: friend.username,
			avatar: friend.avatar_link,
			id: friend.id
		}})
	}

	return ( 
		<div className="scroll-to-hide online-friends w-full h-[40px] items-center gap-3 flex overflow-x-auto">
			{
				state.onlineFriends.length == 0 && <p>no online friend</p>
			}
			{
				state.onlineFriends.length > 0 &&
				state.onlineFriends.map((friend, index) => {
					return <User border onClick={() => clickHandler(friend)} key={index} online className="h-[40px] border min-w-[40px] cursor-pointer" url={friend.avatar_link} />
				})
			}
		</div>
	);
}

export default OnlineFriends;