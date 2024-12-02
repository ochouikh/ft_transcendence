import { HTMLAttributes, MutableRefObject } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdError } from "react-icons/md";
import { dateMeta } from "@/utils/global";

type ArrivedMsg = "arrive";
type SentMessage = "sent";

interface MessageProps extends HTMLAttributes<HTMLDivElement> {
	children: string
	type: ArrivedMsg | SentMessage,
	date: string
	className?: string
	state?: 'processing' | 'ok' | 'error',
	lastDate: MutableRefObject<string | null>
}

const Message = ({type = "arrive", children, date, className, state, lastDate, ...props}: MessageProps) => {
	const first = date.split(' ')[0];
	const second = date.split(' ')[1].split(':');
	let newDate = false;

	if (first != lastDate.current) {
		lastDate.current = first;
		newDate = true;
	}

	return (
		<>
			{newDate && <div className="text-center">{dateMeta.getDay(first)}</div>}
			<div
				className={`max-w-[70%] xl:max-w-[600px] 2xl:max-w-[800px] flex flex-col gap-1 ${type == 'arrive' ? 'self-start' : 'self-end'}` + (className ? (" " + className) : '')}
				{...props}
				>
				<div className={`flex items-center gap-2 font-extralight text-[14px] ${type == 'arrive' ? 'self-start' : 'self-end'}`}>
					{state == 'processing' && <AiOutlineLoading3Quarters className="animate-spin" /> }
					{state == 'error' && <MdError className="fill-red-600" /> }
					<span>{second[0] + ':' + second[1]}</span>
				</div>
				<div
					className={`font-normal break-words border border-border bg-bg rounded-xl px-5 py-2 ${type == 'arrive' ? ' text-white text-left rounded-tl-none' : 'text-black text-right bg-primary rounded-tr-none'}`}
					>{children}</div>
			</div>
		</>
	)
}

export default Message;