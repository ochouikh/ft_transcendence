import add_icon from "/add_icon.svg"
import { ProfileRequest } from "@/types/profile";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore";
import { modifyObjectByName } from "../UserActions";
import block from "/block.svg"

const AddFriend = ({username, origin}: {username?: string, origin: string}) => {

	const { sendJsonMessage } = useGlobalWebSocketContext();
	const { state, dispatchProfile } = useProfileContext();

	const clickHandler = (type: "add" | "block") => {
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

	return (
		<div className="flex items-center justify-between h-[40px] w-[180px] select-none gap-2">
			<div onClick={() => clickHandler("add")} className="w-full h-full flex justify-center items-center bg-secondary rounded-md cursor-pointer gap-2">
				<span>add</span>
				<img src={add_icon} alt="ADD" width={20} height={20}/>
			</div>
			<div onClick={() => clickHandler("block")} className="bg-secondary flex justify-center items-center w-full h-full rounded-md cursor-pointer gap-2">
				<span>block</span>
				<img src={block} alt="BLOCK" width={20} height={20}/>
			</div>
		</div>
	)
}

export default AddFriend;