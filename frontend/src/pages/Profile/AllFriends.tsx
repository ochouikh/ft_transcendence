import { useEffect, useRef, useState } from "react"
import { FriendsData } from "@/types/profile"
import FriendBar from "./FriendBar"
import { AnimatePresence, motion } from "framer-motion"
import { useParams } from "react-router-dom"
import RelationBar from "./RelationBar"
import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore"
import api from "@/api/axios"
import { useQuery } from "@tanstack/react-query"

const FriendSkeleton = () => {
	return (
		<div className="flex justify-between items-center w-full gap-3 h-[70px] rounded-md border border-border bg-gray3 px-5 animate-pulse">
			<div className="flex items-center gap-4 cursor-pointer shrink overflow-hidden whitespace-nowrap">
					<span className="rounded-full size-9 shrink-0 bg-[#2F2F2F]" />
					<span className="shrink w-16 h-[15px] rounded-md bg-[#2F2F2F]" />
			</div>
			<div className="w-[100px] h-[30px] rounded-md bg-[#2F2F2F]" />
		</div>
	)
}

async function fetchData(uri: string) {
	const res = await api.get(uri + "/");
	return res;
}

const AllFriends = () => {
	const { id } = useParams();
	const newUri = useRef<string>(id ? "friends/" + id : "friends");
	const {data, isLoading, isError, isRefetching} = useQuery({queryKey: ['allFriends', id], queryFn: () => fetchData(newUri.current), refetchInterval: 5000});
	const { state, dispatchProfile } = useProfileContext();
	const [relation, setRelation] = useState<string>("friend");
	const refScroll = useRef(null);
	const refFriend = useRef();
	const refPending = useRef();
	const refBlocked = useRef();
	const refInput = useRef<HTMLInputElement | null>(null);
	const searchData = useRef<string>('');

	const stopScroll = useRef(false);
	const countScroll = useRef(10);

	const collectData = async (uri: string, isscroll?: boolean) => {
		try {
			const ProfileRes: FriendsData[] = await api.get(uri).then((e) => e.data);
			if (isscroll)
			{
				(ProfileRes.length < 10) && (stopScroll.current = true);
				state.friendsData ?
				dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: state.friendsData.concat(ProfileRes)})
				:
				dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: ProfileRes});
			}
			else
				dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: ProfileRes});
		}
		catch (err: any) {
			dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: null});
		}
	}

	const reset = (element : any) => {
		element.children[0].classList.value = "duration-500 font-normal";
		element.children[1].classList.value = "duration-500 border-b border-primary w-full absolute top-full -translate-x-full";
	}

	const apply = (element : any) => {
		element.children[0].classList.value = "duration-500 text-primary font-medium";
		element.children[1].classList.value = "duration-500 border-b border-primary w-full";
	}
	
	const resetAll = () => {
		reset(refFriend.current);
		reset(refPending.current);
		reset(refBlocked.current);
	}

	const HandleClick = (ref: any, newRelation: string, uri: string) => {
		if (relation == newRelation)
			return ;

		(refInput.current) && (refInput.current.value = '');
		dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: null});
		resetAll();
		apply(ref.current);
		
		stopScroll.current = false;
		countScroll.current = 10;
		
		setRelation(newRelation);
		newUri.current = uri;
		collectData(uri + "/");
	}

	useEffect(() => {
		if (!isLoading)
			dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: data?.data});
	}, [isLoading]);

	useEffect(() => {
		if (!isRefetching)
			dispatchProfile({type: PROFILE_OPTS.FRIEND_DATA, friendsData: data?.data});
	}, [isRefetching]);

	const scrollHandler  = (e: any) => {
		const start: any = refScroll.current;
		const end = e.target.lastChild;
		if (!end)
			return ;
		const lastPart: number = end.getBoundingClientRect().top - start.getBoundingClientRect().top;
		if (!stopScroll.current && lastPart <= 520)
		{
			let name;
			if (relation == "friend")
				name = id ? "friends/" + id : "friends";
			else if (relation == "rec_req")
				name = "pending";
			else if (relation == "blocker")
				name = "blocked";
			newUri.current = name + "/?filter=" + searchData.current + "&start=" + countScroll.current.toString() + "&end=" + (countScroll.current + 10).toString();
			collectData(newUri.current, true);
			countScroll.current += 10;
		}
	}

	const HandleChange = (e: any) => {
		stopScroll.current = false;
		countScroll.current = 10;
		searchData.current = e.currentTarget.value;
		let name;
		if (relation == "friend")
			name = id ? "friends/" + id : "friends";
		else if (relation == "rec_req")
			name = "pending";
		else if (relation == "blocker")
			name = "blocked";
		newUri.current = name + "/?filter=" + searchData.current;
		collectData(newUri.current);
	}

	return (
		<>
		<AnimatePresence>
			<motion.div
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{duration: 0.3}}
				exit={{ opacity: 0}}
				className="w-full overflow-hidden bg-secondary p-5 sm:p-10 rounded-md space-y-5">
				<div className="flex justify-between max-w-[268px] w-full gap-2">
					<RelationBar ref={refFriend} onClick={() => HandleClick(refFriend, "friend", id ? "friends/" + id : "friends")} width={59} name={"Friends"} active={true} />
					{
						!(id) &&
						<>
							<RelationBar ref={refPending} onClick={() => HandleClick(refPending, "rec_req", "pending")} width={67} name={"Pending"} active={false} />
							<RelationBar ref={refBlocked} onClick={() => HandleClick(refBlocked, "blocker", "blocked")} width={63} name={"Blocked"} active={false} />
						</>
					}
				</div>
				<input ref={refInput} onChange={(e) => HandleChange(e)} type="text" placeholder="search" className="outline-none w-full bg-transparent border-b-[0.5px] px-3 py-[9px] font-thin" />
				<div ref={refScroll} onScroll={scrollHandler} className="h-[226px] overflow-auto overscroll-none scrollClass pr-2 space-y-2">
					{ isLoading && <FriendSkeleton /> }
					{ ((state.friendsData && state.friendsData.length == 0 && !isLoading) || isError) && <div className="text-center">empty list</div> }
					{
						!isLoading && !isError && state.friendsData && state.friendsData.length > 0 && state.friendsData.map((friend: FriendsData, index: number) => {
							return (
								<FriendBar key={index} friend={friend} relation={friend.relation}/>
							)
						})
					}
				</div>
			</motion.div>
		</AnimatePresence>
		</>
	)
}

export default AllFriends;