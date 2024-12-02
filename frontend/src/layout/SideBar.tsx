import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { useLocation, useNavigate } from "react-router-dom";
import Polygon from "@/components/helpers/Polygon";
import Title from "@/components/Title";
import { useChatContext } from "@/contexts/chatProvider";
import { AnimatePresence, motion } from "framer-motion";

interface SideBarElemProps extends ComponentProps<'div'> {
	children: string
}

export const variants = {
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

export function SideBarElem({children, ...props}: SideBarElemProps) {
	const { pathname } = useLocation();
	const { state } = useChatContext();
	const isActive = pathname == '/' + children.toLocaleLowerCase();

	return ( 
		<div className='relative' {...props} >
			<span className='w-[21px] h-full bg-secondary absolute top-0 left-0 cursor-pointer'></span>
			<Polygon
				className={'flex justify-start gap-3 bg-secondary ' + (isActive ? 'text-primary' : 'text-white')}
				>
				<Title 
					firstCharClassName={"duration-300 " + (isActive ? 'text-primary text-xl' : 'text-white text-xl')} 
					restWordClassName={"duration-300 " + (isActive ? 'text-primary text-md' : 'text-white text-md')} >
						{children}
				</Title>
				<AnimatePresence>
					{children == 'Chat' && state.unreadConv && 
						<motion.div
							initial='hidden'
							animate='visible'
							exit='hidden'
							variants={variants}
							className="bg-red-500 size-[10px] rounded-full" />
					}
				</AnimatePresence>
			</Polygon>
		</div>
	);
}


function SideBar({ className }: { className?: string }) {
	const navigate = useNavigate();

	return (
		<>
			<div className={twMerge('w-[245px] space-y-5 bg-bg', className)}>
				<SideBarElem onClick={() => navigate('/dashboard')}>Dashboard</SideBarElem>
				<SideBarElem onClick={() => navigate('/chat')}>Chat</SideBarElem>
				<SideBarElem onClick={() => navigate('/settings')}>Settings</SideBarElem>
			</div>
			<div className={twMerge("w-[245px] shadow-right space-y-5 bg-bg fixed top-20 left-0 ", className)}>
				<SideBarElem onClick={() => navigate('/dashboard')}>Dashboard</SideBarElem>
				<SideBarElem onClick={() => navigate('/chat')}>Chat</SideBarElem>
				<SideBarElem onClick={() => navigate('/settings')}>Settings</SideBarElem>
			</div>
		</>
	);
}

export default SideBar;