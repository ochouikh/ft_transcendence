import { ProfileRequest } from "@/types/profile"
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore";
import deny from "/deny.svg"
import accept from "/accept.svg"
import { modifyObjectByName } from "../UserActions";

const PendingInvitation = ({username, origin}: {username?: string, origin: string}) => {
	const { sendJsonMessage } = useGlobalWebSocketContext();
	// const userData = useContext(profileContext);
	const { state, dispatchProfile } = useProfileContext();

	const clickHandler = (type: "accept" | "deny") => {
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
		<div className="shrink-0 w-[140px] h-[40px] flex justify-between items-center">
			<div onClick={() => clickHandler("deny")} className="h-full w-[40px] bg-secondary rounded-md select-none flex justify-center items-center">
				<img src={deny} alt="DENY" width={20} height={20}/>
			</div>
			<div onClick={() => clickHandler("accept")} className="h-full w-[90px] bg-secondary rounded-md cursor-pointer select-none flex justify-center items-center gap-1">
				<span>accept</span>
				<img src={accept} alt="ACCEPT" width={20} height={20}/>
			</div>
		</div>
	)
}

export default PendingInvitation;