import { useNotificationsContext } from "@/contexts/notificationsProvider";
import Notification from "@/components/Notification";
import { AnimatePresence, motion } from "framer-motion";

function NewNotifications() {
	const { state } = useNotificationsContext();

	return ( 
		<AnimatePresence>
			{
			state.newNotifications.length > 0 && 
				<motion.div 
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3 }}
					className="absolute z-50 right-0 top-full w-[90vw] max-w-[450px] max-h-[400px] p-5 border border-border rounded-md bg-bg overflow-auto space-y-5">
					<Notification notData={state.newNotifications[0]} />
				</motion.div>
			}
		</AnimatePresence>
	);
}

export default NewNotifications;