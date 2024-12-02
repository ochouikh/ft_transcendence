import User from "@/components/User";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import { IoIosArrowBack } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";
import useIsOnline from "@/hooks/useIsOnline";
import FriendActions from "./FriendActions";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

function ConversationHeader() {
	const { state, dispatch } = useChatContext();
	const isOnline = useIsOnline(state.conversation_header.username);
	const [ moreOptions, setMoreOptions ] = useState(false);

	const handler = () => {
		dispatch({type: CHAT_OPTS.FOCUS, state: false})
	}

	return ( 
		<div className="w-full px-5 py-3 border-b border-b-dark shrink-0 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<IoIosArrowBack onClick={handler} className="lg:hidden text-xl cursor-pointer" />
				{state.conversation.state == 'ok' &&
					<>
						<Link to={'/users/' + state.conversation_header.username}>
							<User border className="size-[30px] cursor-pointer" url={state.conversation_header.avatar} />
						</Link>
						<div className="flex gap-2 items-end">
							<Link to={'/users/' + state.conversation_header.username}>
								<h2>{state.conversation_header.username}</h2>
							</Link>
							{isOnline && <h3 className="text-sm font-light text-green-500">online</h3>}
						</div>
					</>
				}
				{state.conversation.state == 'loading' && 
					<>
						<span className="size-[30px] rounded-full bg-gray2 animate-pulse"/>
						<h2 className="w-24 h-4 bg-gray2 rounded-full" />
					</>
				}
			</div>
			<BsThreeDots onClick={() => setMoreOptions(prev => !prev)} className="relative text-white cursor-pointer text-xl" />
			{moreOptions && <div onClick={() => setMoreOptions(false)} className='absolute top-0 left-0 w-full h-full bg-black opacity-0' />}
			<AnimatePresence>
				{moreOptions && <FriendActions 
					onClick={() => setMoreOptions(false)} 
					className='absolute top-[50px] right-3'
					close={() => setMoreOptions(false)}
				/>}
			</AnimatePresence>
		</div>
	);
}

export default ConversationHeader;