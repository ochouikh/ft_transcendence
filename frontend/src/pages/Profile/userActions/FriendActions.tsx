import play_icon from "/play_icon.svg"
import send_icon from "/send_icon.svg"
import more_icon from "/more_icon.svg"
import block from "/block.svg"
import unfriend from "/unfriend.svg"
import deny from "/deny.svg"
import { ProfileRequest } from "@/types/profile"
import {  useState } from "react"
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore"
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore"
import { modifyObjectByName } from "../UserActions"
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider"
import { useAuthContext } from "@/contexts/authProvider"
import { useNavigate } from "react-router-dom"
import api from "@/api/axios"

const FriendActions = ({username, origin}: {username?: string, origin: string}) => {
	const { sendJsonMessage } = useGlobalWebSocketContext();
	const { dispatch: chatDispatch, sendJsonMessage: sendChatJsonMessage } = useChatContext();
	const { state: authState } = useAuthContext();
	// const userData = useContext(profileContext);
	const { state, dispatchProfile } = useProfileContext();
	const [seeMore, setSeeMore] = useState<boolean>(false);
	const navigate = useNavigate();

	const clickHandler = (type: "unfriend" | "block" | "invite") => {
		if (origin === "profile") {
			const updatedArray = modifyObjectByName(state.friendsData, username);
			if (updatedArray) {
				dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: [...updatedArray]});
			}
		}
		else if (origin === "user")
			dispatchProfile({type: PROFILE_OPTS.USER_DATA, userData: {...state.userData, relation: undefined}});
		const request: ProfileRequest = {
			type: type,
			identifier: username,
			data: {}
		};
		sendJsonMessage(request);
	}

	const sendMessageHandler = async () => {
		sendChatJsonMessage({
			type: 'getConversation',
			user1: authState.username, 
			user2: username
		})
		navigate('/chat');
		const userData = await api.get('users/' + username);
		chatDispatch({type: CHAT_OPTS.CONVERSATION_HEADER, conversation_header: {
			username: userData.data.username,
			avatar: userData.data.profile_image,
			id: userData.data.id
		}})
	}

	return (
		<div className="shrink-0 w-[140px] h-[40px] flex justify-between items-center">
			{
				seeMore ?
				<>
					<div onClick={() => clickHandler("unfriend")} className="bg-secondary w-[40px] flex justify-center items-center h-full rounded-md cursor-pointer select-none">
						<img src={unfriend} alt="UNFRIEND" width={20} height={20}/>
					</div>
					<div onClick={() => clickHandler("block")} className="bg-secondary w-[40px] flex justify-center items-center h-full rounded-md cursor-pointer select-none">
						<img src={block} alt="BLOCK" width={20} height={20}/>
					</div>
				</>
				:
				<>
					<div onClick={() => clickHandler("invite")} className="bg-secondary w-[40px] flex justify-center items-center h-full rounded-md cursor-pointer select-none">
						<img src={play_icon} alt="PLAY" width={20} height={20}/>
					</div>
					<div 
						onClick={sendMessageHandler}
						className="bg-secondary w-[40px] flex justify-center items-center h-full rounded-md cursor-pointer select-none">
						<img src={send_icon} alt="SEND" width={20} height={20}/>
					</div>
				</>
			}
			<div onClick={() => setSeeMore(!seeMore)} className="flex gap-[0.5px] bg-secondary w-[40px] justify-center items-center h-full rounded-md cursor-pointer select-none">
				{
					seeMore ?
						<img src={deny} alt="DENY" width={20} height={20}/>
					:
					<>
						<img src={more_icon} alt="MORE" width={5.36} height={5.36}/>
						<img src={more_icon} alt="MORE" width={5.36} height={5.36}/>
						<img src={more_icon} alt="MORE" width={5.36} height={5.36}/>
					</>
				}
			</div>
		</div>
	)
}

export default FriendActions;
