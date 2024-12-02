import { useEffect, useState } from "react";
import { AUTH_OPTS, useAuthContext } from "@/contexts/authProvider";
import jwt from "@/utils/jwt";
import ChatContextProvider from "@/contexts/chatProvider";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import TournamentContextProvider from "@/contexts/TournamentProvider";
import ProfileContextProvider from "@/contexts/profileStore";
import GlobalWebSocketContextProvider from "@/contexts/globalWebSokcketStore";
import LoadingPage from "@/components/LoadingPage";

function AuthGuard() {
	const { state, dispatch } = useAuthContext();
  	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const checkAuth = async (aToken: string | null) => {
			
			if (!jwt.isValid(aToken)) {

			const token = await jwt.refresh();
			if (!token) {
				navigate('/login', {
					state: { 
						refer: 
						location.pathname 
					}
				})
			}
			else {
				dispatch({type: AUTH_OPTS.TOKEN, token: token});
			}
		  }
		  setLoading(false);
		};

		checkAuth(state.accessToken);

	  }, [state.accessToken]);
	
	  if (loading) {
		return <LoadingPage />
	  }
	
	  if (!state.accessToken) {
		return <Navigate to="/login" replace state={{refer: location.pathname}} />;
	  }
	  
	return (
		<ChatContextProvider>
			<TournamentContextProvider>
				<ProfileContextProvider>
					<GlobalWebSocketContextProvider>
						<Outlet />
					</GlobalWebSocketContextProvider>
				</ProfileContextProvider>
			</TournamentContextProvider>
		</ChatContextProvider>
	)
}

export default AuthGuard;