import { useNavigate } from "react-router-dom";
import Notifications from "@/components/Notifications";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import { SideBarElem } from "./SideBar";
import useLog from "@/hooks/useLog";
import { Variants, motion } from "framer-motion";
import { MdOutlineLogout } from "react-icons/md";
import { BiUser } from "react-icons/bi";

export type DropMenuTypes = null | 'profile' | 'notification' | 'navbar';

interface DropMenuProps {
	type: DropMenuTypes
}

export const dropDownVariants: Variants = {
	hidden: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.3
		}
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3
		}
	}
}

function DropMenu({ type }: DropMenuProps) {
	const {dispatch} = useGlobalContext();
	const navigate = useNavigate();
	const action = useLog();

	const goToProfile = () => {
		dispatch({type: STORE_OPTS.LOADING, state: true})
		navigate('/profile')
	}

	{/* profile actions */}
	if (type == 'profile') {
		return (
			<motion.div 
				initial='hidden'
				animate='visible'
				exit='hidden'
				variants={dropDownVariants}
				className="absolute z-50 right-0 top-full flex flex-col px-1 py-1 border border-border bg-bg rounded-md select-none overflow-hidden ">
				<button
					onClick={goToProfile}
					className='flex gap-2 items-center px-2 py-2 min-w-48 rounded-sm hover:bg-gray3 duration-300'
					>
					<BiUser />
					Profile
				</button>
				<button 
					onClick={() => action('LOGOUT')} 
					className='flex gap-2 items-center px-2 py-2 min-w-48 rounded-sm hover:bg-gray3 duration-300'>
					<MdOutlineLogout />
					Log out
				</button>
			</motion.div>
		)
	}

	{/* notifications */}
	if (type == 'notification') {
		return (
			<motion.div 
				initial='hidden'
				animate='visible'
				exit='hidden'
				variants={dropDownVariants}
				className="scrollClass absolute z-50 right-0 top-full w-[90vw] max-w-[450px] max-h-[400px] p-5 border border-border rounded-md bg-bg overflow-auto space-y-5">
				<Notifications />
			</motion.div>
		)
	}
	
	{/* navigation list */}
	if (type == 'navbar') {
		return (
			<motion.div 
				initial='hidden'
				animate='visible'
				exit='hidden'
				variants={dropDownVariants}
				className="space-y-5 w-[250px] absolute z-50 right-0 top-full p-5 bg-bg rounded-lg">
				<SideBarElem onClick={() => navigate('/dashboard')}>Dashboard</SideBarElem>
				<SideBarElem onClick={() => navigate('/chat')}>Chat</SideBarElem>
				<SideBarElem onClick={() => navigate('/settings')}>Settings</SideBarElem>
			</motion.div>
		)
	}
}

export default DropMenu;