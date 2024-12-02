import { useEffect, useState } from "react"
import EditProfile from "./userActions/EditProfile";
import FriendActions from "./userActions/FriendActions";
import AddFriend from "./userActions/AddFriend";
import SendingInvitation from "./userActions/SendingInvitation";
import PendingInvitation from "./userActions/PendingInvitation";
import Blocked from "./userActions/Blocked";
import { Actions, useProfileContext } from "@/contexts/profileStore";
import WaitingAction from "./userActions/WaitingAction";
import { FriendsData } from "@/types/profile";
import GoToProfile from "./userActions/GoToProfile";

export const modifyObjectByName = (array : FriendsData[] | null, username?: string) => {
	const obj: FriendsData | undefined = array ? array.find(obj => obj.username === username) : undefined;
	if (obj) {
		obj.relation = undefined;
		return array;
	}
};

const UserActions = ({isProfile}: {isProfile: boolean}) => {
	const [action, setAction] = useState<Actions | null>(null);
	const { state } = useProfileContext();

	const setActions = (relation: string | undefined) => {
		if (!relation)
			setAction(null);
		else if (relation == 'you')
			setAction(Actions.GoToProfile);
		else if (relation == 'none')
			setAction(Actions.AddFriend);
		else if (relation == 'friend')
			setAction(Actions.Friend);
		else if (relation == 'send_req')
			setAction(Actions.SendingInvitation);
		else if (relation == 'rec_req')
			setAction(Actions.PendingInvitation);
		else if (relation == 'blocker')
			setAction(Actions.Blocked);
	}

	useEffect(() => {
		isProfile ? setAction(Actions.EditProfile) : setActions(state.userData?.relation);
	}, [state.userData?.relation])

	return (
		<>
			{action == null && <WaitingAction />}
			{action == Actions.EditProfile && <EditProfile />}
			{action == Actions.GoToProfile && <GoToProfile />}
			{action == Actions.Friend && <FriendActions username={state.userData?.username} origin="user" />}
			{action == Actions.AddFriend && <AddFriend username={state.userData?.username}  origin="user" />}
			{action == Actions.SendingInvitation && <SendingInvitation username={state.userData?.username} origin="user" />}
			{action == Actions.PendingInvitation && <PendingInvitation username={state.userData?.username} origin="user" />}
			{action == Actions.Blocked && <Blocked username={state.userData?.username} origin="user" />}
		</>
	)
}

export default UserActions;