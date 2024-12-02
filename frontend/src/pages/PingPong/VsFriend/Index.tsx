import { FiSearch } from "react-icons/fi";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FriendsData } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import LayoutHeader from "@/layout/LayoutHeader";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";

function FriendBar({friend} : {friend: FriendsData}) {
	const [send, setSend] = useState<boolean>(false);
	const navigate = useNavigate();
	const { sendJsonMessage } = useGlobalWebSocketContext();

	const goToProfile = () => {
		navigate(friend.profile);
	}

	const sendPlayInv = (username: string) => {
		sendJsonMessage({
			type: "invite",
			identifier: username,
			data: {}
		});
		setSend(true);
	}

	useEffect(() => {
		const delay = setTimeout(() => {
			if (send)
				setSend(false);
		}, 10000);
		return () => clearTimeout(delay);
	}, [send]);

	return (
		<div className="flex justify-between items-center h-[50px] gap-4 shrink-0">
			<div className="h-full w-full flex mobile:justify-between justify-center items-center border border-border rounded-md mobile:px-5 px-3 gap-2">
				<div className="flex items-center gap-4 select-none">
					<div className="relative w-[31px] h-[31px]">
						{
							friend.online &&
							<span className="absolute rounded-full h-[7px] w-[7px] bg-[#1ED947] -translate-x-full -translate-y-full top-full left-full" />
						}
						<img onClick={goToProfile} src={friend.profile_image} alt="PROFILE_IMG" className="w-full h-full rounded-full border border-primary overflow-hidden shrink-0 cursor-pointer" />
					</div>
					<span className="font-normal text-base truncate mobile:w-16 w-10">{friend.username}</span>
				</div>
				<span className="font-normal text-base mobile:block hidden shrink-0">lvl {friend.level.current}</span>
			</div>
			{
				send ?
				<div className="border border-border bg-secondary rounded-md h-full shrink-0 flex justify-center items-center sm:px-10 px-6">
					<span className="text-gray1 sm:text-base text-sm select-none">sent</span>
				</div>
				:
				<div onClick={() => sendPlayInv(friend.username)} className="border border-border bg-bg rounded-md h-full shrink-0 flex justify-center items-center sm:px-9 px-5 cursor-pointer select-none">
					<span className="text-primary sm:text-base text-sm select-none">invite</span>
				</div>
			}
		</div>
	)
}

async function fetchFriends() {
	const res = await api.get('friends/');
	return res;
}

function VsFriend() {
	const {data, isLoading, isError} = useQuery({queryKey: ['playFriends'], queryFn: () => fetchFriends()});
	const [friends, setFriends] = useState<FriendsData[]>(data?.data);
	const scrollRef = useRef(null);
	const stopScroll = useRef<boolean>(false);
	const countScroll = useRef<number>(10);
	const searchData = useRef<string>("");
	const navigate = useNavigate();
	// const { state, dispatch } = usePingPongContext();

	const fetchOtherFriends = async (uri: string, isScroll: boolean) => {
		const res: FriendsData[] = await api.get(uri).then((e) => e.data);
		if (isScroll)
		{
			if (res.length < 10)
				stopScroll.current = true;
			// if (friends)
				setFriends((prev) => prev.concat(res));
			// else
			// 	setFriends(res);
		}
		else
			setFriends(res);
	}

	const scrollHandler = (e: any) => {
		const start: any = scrollRef.current;
		const end = e.target.lastChild;
		if (!end)
			return ;
		const lastPart: number = end.getBoundingClientRect().top - start.getBoundingClientRect().top;
		if (!stopScroll.current && lastPart <= 135)
		{
			fetchOtherFriends("friends/?filter=" + searchData.current + "&start=" + countScroll.current.toString() + "&end=" + (countScroll.current + 10).toString(), true);
			countScroll.current += 10;
		}
	}

	const changeHandler = (e: any) => {
		stopScroll.current = false;
		countScroll.current = 10;
		searchData.current = e.currentTarget.value;
		if (searchData.current == "")
			fetchOtherFriends("friends/?filter=" + searchData.current, false);
	}
	
	const clickHandler = () => {
		if (searchData.current != "")
			fetchOtherFriends("friends/?filter=" + searchData.current, false);
	}

	const handleCancel = () => {
		navigate('/ping-pong');
	}

	useEffect(() => {
		if (!isLoading)
			setFriends(data?.data);
	}, [isLoading]);

	return (
		<>
			<LayoutHeader>VS friend</LayoutHeader>
			<div className="flex justify-center items-center">
				<div className="w-full flex flex-col gap-7">
					<p className="text-base font-normal">Invite your friends to a competitive ping pong match! Challenge them to a fun, fast-paced game and see who comes out on top. Ready to play?</p>
					<div className="flex flex-col gap-5">
						<div className="flex h-[50px] gap-3">
							<input onChange={(e) => changeHandler(e)} type="text" className="w-full h-full border border-border focus:border-primary duration-200 rounded-md px-5 py-3 outline-none bg-transparent" placeholder="search" />
							<div onClick={clickHandler} className="w-[50px] shrink-0 h-full flex justify-center items-center border border-border rounded-md cursor-pointer">
								<FiSearch className='text-2xl' />
							</div>
						</div>
						<div ref={scrollRef} onScroll={(e) => scrollHandler(e)} className="flex flex-col gap-3 max-h-[180px] overflow-auto scrollClass pr-2">
							{
								isError ? <div className="text-center">No Result !!!</div>
								:
								isLoading ?
								<div className="flex justify-between items-center h-[50px] gap-4 shrink-0 animate-pulse">
									<div className="h-full w-full flex mobile:justify-between justify-center items-center border border-border rounded-md mobile:px-5 px-3 gap-2">
										<div className="flex items-center gap-4 select-none">
											<div className="size-[31px] rounded-full bg-border shrink-0" />
											<span className="h-[15px] bg-border rounded-md w-10" />
										</div>
										<span className="mobile:block hidden shrink-0 h-[15px] w-8 bg-border rounded-md" />
									</div>
									<div className="border border-border bg-secondary rounded-md h-full sm:px-10 px-6" />
								</div>
								:
								(
									(friends && friends.length !== 0) ? friends.map((friend: FriendsData, key: number) => {
										return (
											<FriendBar friend={friend} key={key} />
										)
									})
									:
									<div className="text-center">No Result !!!</div>
								)
							}
						</div>
					</div>
					<div className="self-end">
						<span onClick={handleCancel} className="font-extralight cursor-pointer hover:underline duration-300 select-none">back</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default VsFriend;