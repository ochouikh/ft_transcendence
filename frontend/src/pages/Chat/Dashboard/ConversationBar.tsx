import { HTMLAttributes } from "react";
import User from "@/components/User";
import { useAuthContext } from "@/contexts/authProvider";
import { Conversation } from "@/types/chat";

function getDate(last_date: string) {
	const parsedDate = last_date.split(' ');
	const today = (new Date()).toISOString().split('T')[0];
	return parsedDate[0] == today ? parsedDate[1] : parsedDate[0]
}

interface Props extends HTMLAttributes<HTMLDivElement> {
	className?: string
	data: Conversation
}

const ConversationBar = ({className, data, ...props}: Props) => {
	const { state: authState } = useAuthContext();

	const isRead = (): boolean => {
		if (!data.status) {
			if (data.sender == data.friend.username) {
				return false;
			} else {
				return true;
			}
		}
		return true
	}

	return (
		<div 
			className={"w-full flex justify-between items-center duration-300 cursor-pointer " + (className ? ` ${className}` : '')} 
			{...props}>
			<div className="overflow-hidden shrink flex items-center text-[14px]">
				<User border className="shrink-0 mr-2" url={data?.friend?.avatar_link || ''} />
				{data.sender == authState.username && <h1 className=" font-light pr-1">to</h1>}
				<h3 className="shrink-0 overflow-hidden whitespace-nowrap text-ellipsi font-medium">{data.friend.username}</h3>
				<span className="shrink-0 mr-2">:</span>
				<p 
					className={"shrink overflow-hidden whitespace-nowrap text-ellipsis" + (!isRead() ? ' font-normal text-primary' : ' font-thin')}>
					{data.last_message}
				</p>
			</div>
			<span className="text-[14px] whitespace-nowrap font-thin ml-3">{getDate(data.last_date)}</span>
		</div>
	);
}

export default ConversationBar;