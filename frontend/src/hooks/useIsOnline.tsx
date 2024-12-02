import { useEffect, useState } from "react";
import { useChatContext } from "@/contexts/chatProvider";

function useIsOnline(username: string) {
	const { state } = useChatContext();
    const [isOnline, setIsOnline] = useState(false);

	useEffect(() => {
        const is = state.onlineFriends.some((friend) => {
			return friend.username == username
		})
        setIsOnline(is)
    }, [state.onlineFriends, username])

	return isOnline
}

export default useIsOnline;