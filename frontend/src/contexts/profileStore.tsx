import { Dispatch, ReactNode, createContext, useContext, useReducer } from "react";
import { FriendsData, MatchesData, UserData } from "@/types/profile";

export enum Actions {
	GoToProfile,
	EditProfile,
	AddFriend,
	Friend,
	SendingInvitation,
	PendingInvitation,
	Blocked
}

export interface ProfileData {
	userData: UserData | null,
	friendsData: FriendsData[] | null,
	matchesData: MatchesData[] | null,
}

const initialState: ProfileData = {
	userData: null,
	friendsData: null,
	matchesData: null,
};

export enum PROFILE_OPTS {
	USER_DATA,
	FRIEND_DATA,
	MATCHES_DATA
}

export const ProfileContext = createContext<{state: ProfileData, dispatchProfile: Dispatch<any>}>({
	state: initialState,
	dispatchProfile: () => {}
});

const reducer = (state: ProfileData, action: any) => {
	switch (action.type)
	{
		case PROFILE_OPTS.USER_DATA:
			return { 
				...state, 
				userData: action.userData
			}
		case PROFILE_OPTS.FRIEND_DATA:
			return { 
				...state, 
				friendsData: action.friendsData
			}
		case PROFILE_OPTS.MATCHES_DATA:
			return { 
				...state, 
				matchesData: action.matchesData
			}
		default:
			return state;
	}
}

const ProfileContextProvider = ({children} : {children: ReactNode}) => {
	const [state, dispatchProfile] = useReducer(reducer, initialState);

	return (
		<ProfileContext.Provider value={{state, dispatchProfile}}>
			{children}
		</ProfileContext.Provider>
	)
}

export const useProfileContext = () => useContext(ProfileContext);
export default ProfileContextProvider;
