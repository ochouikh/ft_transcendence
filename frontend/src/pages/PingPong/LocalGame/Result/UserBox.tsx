import { twMerge } from "tailwind-merge";
import User from "@/components/User";

interface Props {
	username?: string,
	level?: number,
	userImage?: string
	className?:string
	direction?: "left" | "right"
}

function UserBox({username, level, userImage, className, direction = 'left'}: Props) {
	return (
		<div className={twMerge('flex items-center gap-5', className)}>
			<User url={userImage} className={"size-20 " + (direction == 'right' ? 'order-2' : 'order-1')} />
			<div className={"flex flex-col gap-2 " + (direction == 'right' ? 'order-1' : 'order-2')}>
				<span className="text-base">{username}</span>
				{level !== undefined && <span className="font-light">lvl {level}</span>}
			</div>
		</div>
	);
}

export default UserBox;
