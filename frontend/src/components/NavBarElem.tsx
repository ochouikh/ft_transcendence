import { useNavigate } from 'react-router-dom';
import { HTMLAttributes } from 'react';
import Polygon from './helpers/Polygon';
import { RiDashboardLine } from "react-icons/ri";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FiBell } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";


interface NavBarElemProps extends HTMLAttributes<HTMLDivElement> {
	className?: string,
	type: 'Dashboard' | 'Chat' | 'Notifications' | 'Search' | 'Empty',
}

const NavBarElem = ( {className, type, ...props }: NavBarElemProps) => {
	const navigate = useNavigate();
	let marginRight: string = ' ';
	let txMultiplicator: number = 15;
	let index: number = 1;
	let routeToNavigate: string;

	switch (type) {
		case 'Dashboard':
			index = 3;
			routeToNavigate = '/dashboard';
			marginRight += 'mr-[-98px]';
			break;
		case 'Chat':
			index = 2;
			routeToNavigate = '/chat';
			marginRight += 'mr-[-51px]';
			break;
		case 'Search':
			index = 0;
			marginRight += 'mr-[-77px]';
			break;
		case 'Notifications':
			index = 1;
			marginRight += 'mr-[-113px]';
			break;
		default:
			break;
	}

	const navigateTo = (route: string) => {
		navigate(route);
	}

	const clickHandler = () => {
		if (routeToNavigate != '') {
			navigateTo(routeToNavigate)
		}
	}

	return (
			<Polygon 
				onClick={clickHandler} 
				className={'group bg-secondary gap-4 duration-300 select-none'}
				style={{transform: `translateX(${txMultiplicator * index}px)`}}
				{...props}
				>
				<div className='flex gap-3 w-full'>
					{type == 'Dashboard' && <RiDashboardLine className='text-2xl group-hover:fill-primary' />}
					{type == 'Chat' && <IoChatbubbleOutline className='text-2xl group-hover:stroke-primary' />}
					{type == 'Search' && <FiSearch className='text-2xl group-hover:stroke-primary' />}
					{type == 'Notifications' && <FiBell className='text-2xl group-hover:stroke-primary' />}
					<h1 className={`pointer-events-none opacity-0 group-hover:opacity-100 duration-300 text-primary font-medium group-hover:mr-0` + marginRight}>{type}</h1>
				</div>
			</Polygon>
	)
}

export default NavBarElem;