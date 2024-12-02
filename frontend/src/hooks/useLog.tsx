import { useNavigate } from "react-router-dom";
import { AUTH_OPTS, useAuthContext } from "@/contexts/authProvider";
import api from "@/api/axios";

const useLog = () => {
	const {dispatch} = useAuthContext()
	const navigate = useNavigate();

	const action = async (type: 'LOGIN' | 'LOGOUT') => {
		switch (type) {
			case 'LOGOUT':
				try {
					await api.post('logout/');
					dispatch({type: AUTH_OPTS.TOKEN, token: null})
					navigate('/');
					window.location.reload();
				} catch (error) {
					
				}
				break;
		}
	}

	return action;
}

export default useLog;