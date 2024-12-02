import User from "@/components/User";
import { Friend } from "./SearchFriends";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import { useAuthContext } from "@/contexts/authProvider";
import send_icon from "/send_icon.svg"

interface Props {
    friends: Friend[], 
    onClose: () => void
}

function FriendsResult({friends, onClose}: Props) {
    const { state } = useAuthContext();
    const { dispatch, sendJsonMessage: sendChatJsonMessage} = useChatContext();
    const sendMessageHandler = (friend: any) => {
		sendChatJsonMessage({
			type: 'getConversation',
			user1: state.username, 
			user2: friend.username
		})
		dispatch({type: CHAT_OPTS.CONVERSATION_HEADER, conversation_header: {
			username: friend.username,
			avatar: friend.profile_image,
			id: friend.id
		}})
		onClose();
	}

    return ( 
        <>
            {
                friends.map((friend, index) => {
					return (
						<div 
							key={index}
							className="flex justify-between items-center">
							<div className="flex items-center gap-3">
								<User border url={friend.profile_image} />
								<h3>{friend.username}</h3>
							</div>
							<div 
								onClick={() => sendMessageHandler(friend)}
								className="bg-secondary border border-border size-[40px] flex justify-center items-center rounded-md cursor-pointer select-none">
								<img src={send_icon} alt="" width={20} height={20}/>
							</div>
						</div>
					)
				})   
            }
        </>
     );
}

export default FriendsResult;