import { FriendsData, Relation } from "@/types/profile"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import FriendActions from "./userActions/FriendActions"
import AddFriend from "./userActions/AddFriend"
import PendingInvitation from "./userActions/PendingInvitation"
import Blocked from "./userActions/Blocked"
import SendingInvitation from "./userActions/SendingInvitation"
import WaitingAction from "./userActions/WaitingAction"
import { Actions } from "@/contexts/profileStore"
import GoToProfile from "./userActions/GoToProfile"

const Action = ({username, action}: {username: string, action: Actions | null}) => {
	return (
		<>
			{ action == null && <WaitingAction /> }
			{ (action === Actions.GoToProfile) && <GoToProfile /> }
			{ (action === Actions.Friend) && <FriendActions username={username} origin="profile"/> }
			{ (action === Actions.PendingInvitation) && <PendingInvitation username={username} origin="profile"/> }
			{ (action === Actions.Blocked) && <Blocked username={username} origin="profile"/> }
			{ (action === Actions.AddFriend) && <AddFriend username={username} origin="profile"/> }
			{ (action === Actions.SendingInvitation) && <SendingInvitation username={username} origin="profile"/> }
		</>
	)
}

const FriendBar = ({friend, relation}: {friend: FriendsData, relation: Relation | undefined}) => {
	const navigate = useNavigate();
	const [action, setAction] = useState<Actions | null>(null);

	const userClick = (path:string) => {
		navigate(path);
	}

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
		setActions(relation);
	}, [relation])

	return (
		<div className="flex justify-between items-center w-full gap-3 h-[70px] rounded-md border border-border bg-gray3 px-5">
			<div onClick={() => userClick(friend.profile)} className="flex items-center gap-4 cursor-pointer shrink overflow-hidden whitespace-nowrap">
					<img src={friend.profile_image} alt={"PROFILE_IMG"} width={38} height={38} className="rounded-full overflow-hidden shrink-0"/>
					<span className="shrink overflow-hidden text-ellipsis">{friend.username}</span>
			</div>
			<Action username={friend.username} action={action} />
		</div>
	)
}

export default FriendBar;