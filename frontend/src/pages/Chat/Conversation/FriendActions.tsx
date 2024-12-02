import { ComponentProps, useEffect, useState } from "react";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore"
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import { twMerge } from "tailwind-merge";
// import play_icon from "/play_icon.svg"
// import blockIcon from "/block.svg"
import { MdBlock } from "react-icons/md";
import { TbPingPong } from "react-icons/tb";
import { motion } from "framer-motion";
import { dropDownVariants } from "@/layout/DropMenu";
import { ImSpinner8 } from "react-icons/im";

interface Props extends ComponentProps<'div'> {
	className?: string
	close: () => void
}

function FriendActions({className, close}: Props) {
	const { state, dispatch } = useChatContext();
	const { dispatch: gDispatch } = useGlobalContext();
	const { lastJsonMessage, sendJsonMessage } = useGlobalWebSocketContext();
	const [isInviting, setIsInviting] = useState(false);
	const [isBlocking, setIsBlocking] = useState(false);

	const play = () => {
		setIsInviting(true);
		sendJsonMessage({
			type: "invite",
			identifier: state.conversation_header.username,
  		})
	}

	const block = () => {
		setIsBlocking(true);
		sendJsonMessage({
			type: "block",
			identifier: state.conversation_header.username,
  		})
	}

	useEffect(() => {
		if (!isInviting && !isBlocking) return;
	
		if (lastJsonMessage?.type == 'invite') {
			if (lastJsonMessage?.code == 200) {
				gDispatch({type: STORE_OPTS.ALERT, message: "Invitation sent successfully", dispatch: gDispatch});
			}
			else {
				gDispatch({type: STORE_OPTS.ALERT, message: "Error happens while sending game invitation", isError: true, dispatch: gDispatch});
			}
		}
		else if (lastJsonMessage?.type == "user-action" && lastJsonMessage?.data?.value == 'block') {
			if (lastJsonMessage?.code == 200) {
				dispatch({type: CHAT_OPTS.FOCUS, state: false});
				dispatch({type: CHAT_OPTS.CONVERSATION, conversation: {
					id: null,
					state: null
				}})
				gDispatch({type: STORE_OPTS.ALERT, message: "user blocked successfully", dispatch: gDispatch});
			}
			else {
				gDispatch({type: STORE_OPTS.ALERT, message: "Error happens while blocking.", isError: true, dispatch: gDispatch});
			}
		}
		setIsInviting(false);
		setIsBlocking(false);
		close()
	}, [lastJsonMessage])

	return ( 
		<motion.div
			initial='hidden'
			animate='visible'
			exit='hidden'
			variants={dropDownVariants} 
			className={twMerge("flex flex-col px-1 py-1 border border-border bg-bg rounded-md", className)}>
			<button
				className="flex gap-2 items-center px-2 py-2 min-w-48 rounded-sm hover:bg-gray3 duration-300" 
				onClick={play}>
				{isInviting && <div className="w-full flex justify-center py-1 items-center">
					<ImSpinner8 className="animate-spin" />
				</div>}
				{!isInviting && <>
					<TbPingPong className="stroke-primary" />
					Request a game
				</>}
			</button>
			<button
				className="flex gap-2 items-center px-2 py-2 min-w-48 text-gray1 rounded-sm hover:bg-gray3 duration-300" 
				onClick={block}>
				<MdBlock className="fill-gray1" />
				Block
			</button>
		</motion.div>
	 );
}

export default FriendActions;