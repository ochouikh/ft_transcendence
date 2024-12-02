import InfiniteScrollObserver from "./InfiniteScrollObserver";
import { INotification } from "@/contexts/store";
import Notification from "./Notification";
import { useEffect, useState } from "react";
import { NOTIFICATION_OPTS, useNotificationsContext } from "@/contexts/notificationsProvider";
import { MdOutlineClearAll } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

async function getNotifications() {
    const res = await api.get('notifications/?start=0&end=10')
    return res;
}

function Notifications() {
	const [notifications, setNotifications] = useState<INotification[]>([]);
	const { lastJsonMessage, sendJsonMessage } = useGlobalWebSocketContext();
	const { dispatch } = useNotificationsContext();
	const { data, isLoading, isError } = useQuery({
        queryKey: ['notifications'], 
        queryFn: async () => getNotifications(),
		staleTime: 0,
		gcTime: 0
    });
	const [isClearing, setIsClearing] = useState(false);

	const whenFetched = (data: any) => {
		setNotifications(prev => [...prev, ...data]);
	}

	const clearNotifications = () => {
		setIsClearing(true);
		sendJsonMessage({
			type: "noti_clear",
			identifier: '-',
			data: {}
		})
	}

	useEffect(() => {
		dispatch({type: NOTIFICATION_OPTS.MARK_IS_READ, payload: true});
		sendJsonMessage({
			type: "noti_read",
			identifier: '--',
			data: {}
		})
		if (data) {
			setNotifications(data.data)
		}
	}, [data])

	useEffect(() => {
		if (lastJsonMessage) {
			if (lastJsonMessage.type == 'noti_delete') {
				if (lastJsonMessage.code == 200) {
					setNotifications([]);
				}
				setIsClearing(false);
			}
		}
	}, [lastJsonMessage])

	if (isLoading) {
		return (
			<div className="absolute z-50 left-0 top-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
				<AiOutlineLoading3Quarters className='animate-spin' />
			</div>
		)
	}

	if (isError) {
		return <h1>error</h1>
	}

	return ( 
		<>
			{
				isClearing && 
				<div className="absolute z-50 left-0 top-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
					<AiOutlineLoading3Quarters className='animate-spin' />
				</div>
			}
			{
				notifications.length == 0 && 
				<div>you have no notifications</div>
			}
			{
				notifications.length > 0 &&
				<>
					<div className="flex justify-end">
						<button 
							onClick={clearNotifications}
							className="flex items-center gap-2 border p-1 px-3 rounded-lg border-dark">
							<span className="text-sm text-gray1">clear all</span>
							<MdOutlineClearAll className="fill-gray1" />
						</button>
					</div>
					{
						notifications.map((notification, index) => {
							return (
								<Notification key={index} notData={notification} />
							)
						})
					}
					<InfiniteScrollObserver
						endPoint="notifications"
						start={10}
						chunkSize={10}
						whenFetched={whenFetched} />
				</>
			}
		</>
	);
}

export default Notifications;