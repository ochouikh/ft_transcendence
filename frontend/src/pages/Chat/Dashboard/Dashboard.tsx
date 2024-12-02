import ConversationsList from "./ConversationsList";
import { AnimatePresence, motion } from 'framer-motion'
import { IoAddCircle } from "react-icons/io5";
import OnlineFriends from "./OnlineFriends";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import SearchFriends from "./SearchFriends";
import { CHAT_OPTS, useChatContext } from "@/contexts/chatProvider";
import Input from "@/components/Input";
import SearchConversationsList from "./SearchConversationsList";
import Modal from "@/components/Modal";

function Dashboard() {
	const [toggleSearch, setToggleSearch] = useState(false);
	const [searchFriends, setSearchFriends] = useState(false);
	const { state: chatState, dispatch } = useChatContext();
	const [input, setInput] = useState('');

	useEffect(() => {
		const result = chatState.conversations.filter((conv) => {
			if (conv.last_message.includes(input)) return true
			else if (conv.friend.username.includes(input)) return true
			else if (conv.sender.includes(input)) return true
			return false;
		})
		dispatch({type: CHAT_OPTS.SEARCH_CONVERSATIONS, conversations: result})
	}, [input])

	return ( 
		<motion.div
			initial={{opacity: 1}}
			exit={{opacity: 1}}
			transition={{duration: 0.5}}
			className="w-full lg:pr-5 pt-5 h-full relative flex flex-col z-0 lg:max-w-[400px] bg-bg lg:border-r lg:border-r-dark">
			<div className="scroll-to-hide flex flex-col overflow-auto grow">
				{/* Chat header */}
				<div className="flex justify-between items-center pb-10 shrink-0">
					<h1></h1>
					<div className="relative flex gap-3 items-center">
						<IoAddCircle onClick={() => setSearchFriends(true)} className="fill-primary text-3xl cursor-pointer" />
					</div>
				</div>
				{/* online friends */}
				<div>
					<h2 className="mb-5">online</h2>
					<OnlineFriends />
				</div>
				{/* conversations */}
				<div className="lg:max-w-[420px] pt-10">
					<div className="flex justify-between items-center mb-5 relative z-10">
						<h2>conversations</h2>
						<FiSearch onClick={() => setToggleSearch(prev => !prev)} className="text-xl cursor-pointer hover:stroke-primary duration-300" />
					</div>
					<AnimatePresence>
						{toggleSearch &&
							<motion.div
								initial={{marginTop: '-48px', opacity: 0}}
								animate={{marginTop: 0, opacity: 1}}
								exit={{marginTop: '-48px', opacity: 0}}
								transition={{duration: 0.3}}
								className="pb-5"
								>
								<form onSubmit={e => { e.preventDefault(); }} 
									className="flex justify-between gap-2">
									<Input onChange={(e) => setInput(e.target.value)} type="text" placeholder="search" className='w-full bg-transparent border border-border h-[48px] px-3 rounded-md outline-none' />
								</form>
							</motion.div>
						}
					</AnimatePresence>
					{!toggleSearch && <ConversationsList className="shrink-0" />}
					{toggleSearch && <SearchConversationsList input={input} className="shrink-0" />}
				</div>
				{/* search friends */}
				<Modal isOpen={searchFriends} onClose={() => setSearchFriends(false)}>
					<SearchFriends onClose={() => setSearchFriends(false)} />
				</Modal>
			</div>
			{/* <NavBar className="lg:hidden w-full py-5 bg-bg border-t border-dark flex items-center justify-between shrink-0" /> */}
		</motion.div>
	);
}

export default Dashboard;