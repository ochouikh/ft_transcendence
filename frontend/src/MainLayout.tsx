import { Outlet, useLocation } from "react-router-dom";
import Alert from "./components/Alert";
import { useEffect } from "react";
import { STORE_OPTS, useGlobalContext } from "./contexts/store";
import { NOTIFICATION_OPTS, useNotificationsContext } from "./contexts/notificationsProvider";

function MainLayout() {
	const { dispatch } = useGlobalContext()
	const { dispatch: notDispatch } = useNotificationsContext();
	const location = useLocation();

	useEffect(() => {
		notDispatch({type: NOTIFICATION_OPTS.CLEAR})
		dispatch({type: STORE_OPTS.SEARCH, state: false})
		dispatch({type: STORE_OPTS.ALERT_OFF})
	}, [location.pathname])
	
	return (
		<>
			<Alert />
			<Outlet />
		</>
	)
}

export default MainLayout;