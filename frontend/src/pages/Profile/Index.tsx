import States, { StatesSkeleton } from "./States";
import History, { HistorySkeleton } from "./History";
import Friends, { FriendsSkeleton } from "./Friends";
import ProfileHeader, { ProfileHeaderSkeleton } from "./ProfileHeader";
import { useEffect, useRef } from "react";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import {  useParams } from "react-router-dom";
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { AUTH_OPTS, useAuthContext } from "@/contexts/authProvider";
import { PiSmileySad } from "react-icons/pi";

async function fetchData(id: string | undefined) {
	const uri: string = id ? "users/" + id : "profile";
	const res = await api.get(uri + "/");
	return res;
}

const Index = () => {
	const { id } = useParams();
	const refetch = useRef<number | false>(5000);
	const {data, isLoading, isError, isRefetching} = useQuery({queryKey: ['profile', id], queryFn: () => fetchData(id), refetchInterval: refetch.current});
	const { state, dispatchProfile } = useProfileContext();
	const { dispatch } = useGlobalContext();
	const { dispatch: authDispatch } = useAuthContext();
	
	useEffect(() => {
		if (!isLoading)
		{
			dispatchProfile({type: PROFILE_OPTS.USER_DATA, userData: data?.data});
			if (!id)
			{
				dispatch({type: STORE_OPTS.USER_DATA, userData: data?.data});
				authDispatch({type: AUTH_OPTS.USERNAME, username: data?.data.username});
			}
		}
	} ,[isLoading, id])

	useEffect(() => {
		if (!isRefetching)
		{
			dispatchProfile({type: PROFILE_OPTS.USER_DATA, userData: data?.data});
			if (!id)
			{
				dispatch({type: STORE_OPTS.USER_DATA, userData: data?.data});
				authDispatch({type: AUTH_OPTS.USERNAME, username: data?.data.username});
			}
		}
	} ,[isRefetching])


	if (isLoading) {
		return (
			<div className="flex flex-col justify-center items-center relative">
				<ProfileHeaderSkeleton />
					<div className="w-full 2xl:px-0 ">
						<div className="xl:h-[800px] grid grid-cols-1 pt-20 xl:grid-cols-7 xl:mt-[75px] gap-5 pb-7">
							<StatesSkeleton />
							<FriendsSkeleton />
							<HistorySkeleton />
						</div>
					</div>
			</div>
		)
	}

	if (isError) {
		refetch.current = false;
		return (
			<div className="flex flex-col gap-5 mt-20 items-center">
				<PiSmileySad className="text-8xl fill-primary" />
				<h1 className="text-4xl font-semibold">User Not Found</h1>
			</div>
		)
	}

	return (
		<div className="flex flex-col justify-center items-center relative">
			<ProfileHeader />
			{
				state.userData?.relation !== 'you' &&
				<div className="w-full 2xl:px-0 ">
					<div className="xl:h-[800px] grid grid-cols-1 pt-20 xl:grid-cols-7 xl:mt-[75px] gap-5 pb-7">
						<States />
						<Friends />
						<History />
					</div>
				</div>
			}
		</div>
	);
}

export default Index;
