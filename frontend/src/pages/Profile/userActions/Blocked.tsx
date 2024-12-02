import { ProfileRequest } from "@/types/profile";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore";
import unblock from "/unblock.svg"
import { modifyObjectByName } from "../UserActions";

const Blocked = ({username, origin}: {username?: string, origin: string}) => {

	const {sendJsonMessage} = useGlobalWebSocketContext();
	const { state, dispatchProfile } = useProfileContext();

	const clickHandler = () => {
		if (origin === "profile") {
			const updatedArray = modifyObjectByName(state.friendsData, username);
			if (updatedArray) {
				dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: [...updatedArray]});
			}
		}
		else if (origin === "user")
			dispatchProfile({type: PROFILE_OPTS.USER_DATA, userData: {...state.userData, relation: undefined}});
		const request: ProfileRequest = {
			type: "unblock",
			identifier: username,
			data: {}
		};
		sendJsonMessage(request);
	}
	return (
		<div onClick={clickHandler} className="bg-secondary flex items-center justify-center shrink-0 w-[110px] h-[40px] rounded-md select-none cursor-pointer gap-2">
			<span>unblock</span>
			<img src={unblock} alt="UNBLOCK" width={20} height={20}/>
		</div>
	)
}

export default Blocked;