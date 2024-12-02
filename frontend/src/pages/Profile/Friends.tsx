import { useEffect, useState } from "react";
import AllFriends from "./AllFriends";
import { FriendsData } from "@/types/profile";
import { useNavigate, useParams } from "react-router-dom";
import Container from "@/components/Container";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import Modal from "@/components/Modal";

export const FriendsSkeleton = () => {
	return (
		<div className="row-start-1 xl:row-start-2 xl:col-start-1 xl:col-end-4 min-h-[134px] animate-pulse">
			<Container className="h-full select-none" childClassName="relative flex flex-col justify-between items-center px-7 py-5">
				<div className="relative flex justify-between items-center w-full">
					<h1 className="text-2xl font-semibold">Friends</h1>
					<span className="w-[49px] h-[24px] bg-[#2F2F2F] rounded-full"/>
				</div>
			</Container>
		</div>
	)
}

async function fetchData(id: string | undefined) {
	const uri: string = id ? "friends/" + id : "friends";
	const res = await api.get(uri + "/?start=0&end=23");
	return res;
}

const Friends = () => {
	const { id } = useParams();
	const {data, isLoading, isError, isRefetching} = useQuery({queryKey: ['friends', id], queryFn: () => fetchData(id), refetchInterval: 5000});
	const navigate = useNavigate();
	const [friends, setFriends] = useState< FriendsData[] | null >(null);
	const [seeAllFriends, setSeeAllFriends] = useState<boolean>(false);
	
	const userClick = (path:string) => {
		navigate(path);
	}

	useEffect(() => {
		if (!isLoading)
			setFriends(data?.data);
	}, [isLoading]);

	useEffect(() => {
		if (!isRefetching)
			setFriends(data?.data);
	}, [isRefetching]);

	if (isError) {
		return (
			<div className="row-start-1 xl:row-start-2 xl:col-start-1 xl:col-end-4 min-h-[134px]">
				<Container className="h-full select-none" childClassName="relative flex flex-col justify-between items-center px-7 py-5">
					<div className="relative flex justify-between items-center w-full">
						<h1 className="text-2xl font-semibold">Friends</h1>
						<span className="cursor-pointer select-none">see all</span>
					</div>
					<span className="self-center">
						Error
					</span>
				</Container>
			</div>
		)
	}

	return (
		<div className="row-start-1 xl:row-start-2 xl:col-start-1 xl:col-end-4 min-h-[134px]">
			<Container className="h-full select-none" childClassName="relative flex flex-col justify-between items-center px-7 py-5">
				<div className="relative flex justify-between items-center w-full">
					<h1 className="text-2xl font-semibold">Friends</h1>
					<span className="cursor-pointer select-none" onClick={() => setSeeAllFriends(true)}>see all</span>
					<Modal className="w-11/12 max-w-[600px]" isOpen={seeAllFriends} onClose={() => setSeeAllFriends(false)}>
						<AllFriends />
					</Modal>
				</div>
				<div className="flex justify-start items-center gap-3 w-full overflow-hidden">
					{
						isLoading ?
						[1,2,3,4,5].map((key: number) => <span key={key} className="min-w-[40px] h-[40px] bg-[#2F2F2F] rounded-full" /> )
						:
						friends && friends.map((friend: FriendsData, key: number) => {
							return (
								<img onClick={() => userClick(friend.profile)} key={key} className="min-w-[40px] h-[40px] cursor-pointer rounded-full" src={friend.profile_image} alt="PROFILE_IMG" />
							)
						})
					}
				</div>
			</Container>
		</div>
	)
}

export default Friends;