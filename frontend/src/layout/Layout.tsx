import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import SideBar from './SideBar';
import { useEffect } from 'react';
import { STORE_OPTS, useGlobalContext } from '@/contexts/store';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { AUTH_OPTS, useAuthContext } from '@/contexts/authProvider';
import { isMobile } from 'react-device-detect';

async function fetchData() {
	const res = await api.get('profile/');
	return res;
}

const Layout = () => {
	const { state, dispatch } = useGlobalContext();
	const { dispatch: authDispatch } = useAuthContext();
	const {data, isLoading, isError} = useQuery({queryKey: ['getProfile'], queryFn: () => fetchData(), refetchOnMount: true});
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (location.state?.message) {
			dispatch({type: STORE_OPTS.ALERT, message: location.state.message, dispatch})
			navigate(location.pathname, {
				state: null
			});
		}
	}, [])

	useEffect(() => {
		if (!isLoading && !isError) {
			dispatch({type: STORE_OPTS.USER_DATA, userData: data?.data});
			authDispatch({type: AUTH_OPTS.USERNAME, username: data?.data.username});
		}
	}, [isLoading]);

	return (
		<>
			{
				state.isOrientation && isMobile ?
				<></>
				:
				<NavBar />
			}
			<div className='relative z-40 bg-bg flex gap-10 pl-5 pr-5 sm:pl-10 lg:pl-0 sm:pr-10'>
				{
					state.isOrientation && isMobile ?
					<></>
					:
					<SideBar className='px-5 py-10 hidden lg:block z-10 h-[calc(100vh-5rem)]' />
				}
				<div className='w-full mx-auto bg-bg lg:px-5 py-10 overflow-hidden'>
					<Outlet />
				</div>
			</div>
		</>
	)
}

export default Layout;