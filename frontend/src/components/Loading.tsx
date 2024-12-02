import ReactDOM from "react-dom";
import { useGlobalContext } from "@/contexts/store";
import { AnimatePresence, motion } from "framer-motion"

const Loading = () => {
	const { state } = useGlobalContext();
    const portal = document.getElementById('portal');
    if (!portal) return null;

	return ReactDOM.createPortal(
			<AnimatePresence>
				{ state.isLoading && 
					<motion.div
						initial={{ x: '-100%' }}
						animate={{ x: '-75%' }}
						transition={{
							ease: 'easeIn',
							duration: 0.3,
						}}
						exit={{ x: '0' }}
						className="fixed z-50 top-0 w-screen h-1 bg-primary">
					</motion.div> }
			</AnimatePresence>
	, portal)
}

export default Loading;