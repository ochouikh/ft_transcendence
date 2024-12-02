import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalContext } from "@/contexts/store";
import User from "@/components/User";
import { twMerge } from "tailwind-merge";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { useChatContext } from "@/contexts/chatProvider";
import Search from "./Search";
import NotificationsBell from "./NotificationsBell";
import DropMenu, { DropMenuTypes } from "./DropMenu";
import NewNotifications from "./NewNotifications";
import Logo from "@/components/Logo";
import { variants } from "./SideBar";
import { AnimatePresence, motion } from "framer-motion";

const NavBar = ({ className }: {className?: string}) => {
	const { state } = useGlobalContext();
	const {state: chatState} = useChatContext();
	const [dropMenu, setDropMenu] = useState(false);
	const dropMenuType = useRef< DropMenuTypes >(null)
	const container = useRef<HTMLDivElement>(null);
	const { pathname } = useLocation();

	useEffect(() => {
		const elem = container.current
		if (chatState.isFocus && window.innerWidth <= 1024) {
			elem?.classList.remove('z-50');
			elem?.classList.add('z-40');
			elem?.classList.add('lg:z-50');
		} else {
			elem?.classList.remove('z-40');
			elem?.classList.remove('lg:z-50');
			elem?.classList.add('z-50');
		}
	}, [chatState.isFocus])

	useEffect(() => {
		setDropMenu(false);
	}, [pathname])

	return (
		<div
			ref={container} 
			className={twMerge('nav-bar sticky top-0 left-0 h-20 z-40 lg:z-50 shadow-bottom flex justify-between px-5 sm:px-10 bg-bg', className)}>
			<div className='h-20 flex items-center'>
				<Logo responsive className="font-medium" />
			</div>
			<div className="relative flex justify-end items-center gap-5 h-20">
				<Search />
				<NotificationsBell dropMenuType={dropMenuType} setDropMenu={setDropMenu}  />
				<User 
					onClick={() => {
						dropMenuType.current = 'profile';
						setDropMenu(prev => !prev)}
					}
					border 
					className="border-white cursor-pointer size-[30px]" 
					url={state.userData?.profile_image || ''}>
				</User>
				<AnimatePresence>
					{dropMenu && <DropMenu type={dropMenuType.current} />}
				</AnimatePresence>
				<NewNotifications />
				<div className="relative lg:hidden">
					<HiOutlineMenuAlt3
						onClick={() => {
							dropMenuType.current = 'navbar';
							setDropMenu(prev => !prev)}
						}
						className="text-2xl cursor-pointer relative" />
					<AnimatePresence>
						{chatState.unreadConv && 
							<motion.div
								initial='hidden'
								animate='visible'
								exit='hidden'
								variants={variants}
								className="absolute bottom-0 left-0 bg-red-500 size-[10px] rounded-full" />
						}
					</AnimatePresence>

				</div>
				{/* Overlay */}
				{dropMenu && <div
					onClick={() => setDropMenu(false)}
					className="fixed top-0 bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.2)]" />}
				{/* Overlay */}
			</div>
		</div>
	)
}

export default NavBar;