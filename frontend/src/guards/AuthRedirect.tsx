import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AUTH_OPTS, useAuthContext } from '@/contexts/authProvider';
import jwt from '@/utils/jwt';
import LoadingPage from '@/components/LoadingPage';
import useOAuth from '@/hooks/useOAuth';

const AuthRedirect = () => {
  	const { state, dispatch } = useAuthContext();
  	const [loading, setLoading] = useState(true);
  	const [handleOAuth] = useOAuth();
	const location = useLocation();

	useEffect(() => {
		handleOAuth()
	}, [])

	useEffect(() => {
		const checkAuth = async (aToken: string | null) => {
			if (!jwt.isValid(aToken)) {

				const token = await jwt.refresh();
				if (token) {
					dispatch({type: AUTH_OPTS.TOKEN, token: token})
				}
			}
			setLoading(false);
		};

		checkAuth(state.accessToken);
	
	}, [state.accessToken]);

	if (location.state?.isTwoFA) {
		return <Outlet />
	};

	if (loading) {
		return <LoadingPage />
	}
	
	if (state.accessToken) {
		return <Navigate to="/dashboard" replace />;
	}

  	return <Outlet />;
};

export default AuthRedirect;
