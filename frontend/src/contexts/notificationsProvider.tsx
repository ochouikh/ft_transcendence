import { Dispatch, ReactNode, createContext, useContext, useReducer } from "react";
import { INotification } from "./store";

export interface GlobalStateProps {
	newNotifications: INotification[],
	isRead: boolean,
	isLastPopAuto: boolean
}

const initialState: GlobalStateProps = {
	newNotifications: [],
	isRead: true,
	isLastPopAuto: true
};

export const GlobalContext = createContext<{state: GlobalStateProps, dispatch: Dispatch<any>}>({
	state: initialState,
	dispatch: () => {}
});

export enum NOTIFICATION_OPTS {
	PUSH_NOTIFICATION,
	POP_NOTIFICATION,
	MARK_IS_READ,
	CLEAR
}

const reducer = (state: GlobalStateProps, action: any) => {
	switch (action.type)
	{
		case NOTIFICATION_OPTS.PUSH_NOTIFICATION:
			const updated = [...state.newNotifications, action.notification];
			setTimeout(() => {
                action.dispatch({ type: NOTIFICATION_OPTS.POP_NOTIFICATION, auto: true });
            }, 3000);
			return { ...state, newNotifications: updated, bell: true, isLastPopAuto: true }
		case NOTIFICATION_OPTS.POP_NOTIFICATION:
			const upObj = { ...state, isLastPopAuto: action.auto }
			if (state.isLastPopAuto) {
				const newNotifications = state.newNotifications.slice(1);
				upObj.newNotifications = newNotifications;
			};
			return upObj
		case NOTIFICATION_OPTS.MARK_IS_READ:
			return { ...state, isRead: action.payload };
		case NOTIFICATION_OPTS.CLEAR:
			return { ...state,  newNotifications: []}
		default:
			return state;
	}
}

const NotificationsProvider = ({children} : {children: ReactNode}) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<GlobalContext.Provider value={{state, dispatch }}>
			{children}
		</GlobalContext.Provider>
	)
}

export const useNotificationsContext = () => useContext(GlobalContext);
export default NotificationsProvider;
