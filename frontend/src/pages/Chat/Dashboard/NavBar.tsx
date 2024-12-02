import { RiDashboardLine } from "react-icons/ri";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FiBell } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

interface Props {
	className?: string
}

function NavBar({className}: Props) {

	return ( 
		<div className={className}>
			<div className="hidden lg:flex flex-col gap-8 justify-between">
				<Link to='/profile'>
					<div className="w-[25px] h-[25px] border rounded-full"></div>
				</Link>
				<Link to='/dashboard'>
					<RiDashboardLine className="text-[25px] hover:fill-primary duration-300" />
				</Link>
				<Link to='/chat'>
					<IoChatbubbleOutline className="text-[25px] hover:stroke-primary duration-300" />
				</Link>
				<FiBell className="text-[25px] hover:stroke-primary duration-300 cursor-pointer" />
			</div>
			<>
				<Link to='/profile'>
					<div className="lg:hidden w-[25px] h-[25px] border rounded-full"></div>
				</Link>
				<Link to='/dashboard'>
					<RiDashboardLine className="lg:hidden text-[25px] hover:fill-primary duration-300" />
				</Link>
				<Link to='/chat'>
					<IoChatbubbleOutline className="lg:hidden text-[25px] hover:stroke-primary duration-300" />
				</Link>
				<FiBell className="lg:hidden text-[25px] hover:stroke-primary duration-300 cursor-pointer" />
			</>
			<Link to='/settings'>
				<IoSettingsOutline className="text-[25px] hover:stroke-primary duration-300" />
			</Link>
		</div>
	);
}

export default NavBar;