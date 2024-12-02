import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { DropMenuTypes } from "./DropMenu";
import { AnimatePresence, motion } from "framer-motion";
import { NOTIFICATION_OPTS, useNotificationsContext } from "@/contexts/notificationsProvider";
import api from "@/api/axios";

interface Props {
	dropMenuType: MutableRefObject<DropMenuTypes>
	setDropMenu: Dispatch<SetStateAction<boolean>>
}

const bellVariants = {
	hidden: {
		scale: 0,
		transition: {
			duration: 0.3
		}
	},
	visible: {
		scale: [1, 1.2, 1],
		transition: {
			duration: 0.3
		}
	}
}

async function getNotifications() {
    const res = await api.get('notifications/?start=0&end=1')
    return res;
}

function NotificationBell({dropMenuType, setDropMenu}: Props) {
	const { state, dispatch } = useNotificationsContext();
	const { data } = useQuery({
        queryKey: ['searchUsers'], 
        queryFn: async () => getNotifications()
    });

	useEffect(() => {
		if (data) {
			const notifications = data.data;
			// notifications.length > 0 && setBell(!notifications[0].data.read)
			notifications.length > 0 && dispatch({type: NOTIFICATION_OPTS.MARK_IS_READ, payload: notifications[0].read});
		}
	}, [data])

	useEffect(() => {
		if (state.newNotifications.length > 0) {
			state.newNotifications.forEach(not => {
				if (not.type != 'message') {
					dispatch({type: NOTIFICATION_OPTS.MARK_IS_READ, payload: false});
				}
			})
		}
	}, [state.newNotifications])

	return ( 
		<div
			onClick={() => {
				dropMenuType.current = 'notification';
				setDropMenu(prev => !prev)
			}} 
			className="relative flex items-center cursor-pointer">
			<FiBell className="text-2xl" />
			<AnimatePresence>
				{!state.isRead && 
					<motion.span
						initial='hidden'
						animate='visible'
						variants={bellVariants}
						className="absolute -top-1 right-0 size-3 rounded-full bg-red-500" />
				}
			</AnimatePresence>
		</div>
	);
}

export default NotificationBell;