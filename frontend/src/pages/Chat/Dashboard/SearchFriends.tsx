import Input from "@/components/Input";
import { FiSearch } from "react-icons/fi";
import { FormEvent, useState } from "react";
import { isEmpty } from "@/utils/validation";
import api from "@/api/axios";
import { ImSpinner8 } from "react-icons/im";
import FriendsResult from "./FriendsResult";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";

export interface Friend {
	profile_image: string
	username: string
}

interface Props {
	onClose: () => void
}

function SearchFriends({onClose}: Props) {
	const [friends, setFriends] = useState<Friend[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { dispatch } = useGlobalContext();
	const [input, setInput] = useState('');

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true)
		if (isEmpty(input)) {
			setIsLoading(false)
			return;
		}
		try {
			const res = await api.get('friends/?filter=' + input);
			setFriends(res.data);
		} catch (error) {
			dispatch({type: STORE_OPTS.ALERT, isError: true, message: 'An Error Occured', dispatch})
		}
		setInput('');
		setIsLoading(false);
	}

	return (
		<div 
			className="w-[90vw] max-w-[500px] max-h-[300px] overflow-y-hidden bg-secondary rounded-md p-10 space-y-5">
			<form onSubmit={onSubmit} className="flex justify-between gap-2">
				<Input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="search for a friend" className="border border-border w-full" />
				<button type="submit" className="shrink-0 size-[48px] flex justify-center items-center border border-border rounded-md">
					<FiSearch />
				</button>
			</form>
			<div className="space-y-3 max-h-[150px] overflow-auto">
			{
				isLoading && <div className="flex justify-center">
					<ImSpinner8 className="animate-spin" />
				</div>
			}
			{ 
				!isLoading && friends && friends.length == 0 &&
				<div className="text-center">No results found.</div>
			}
			{
				!isLoading && friends && friends.length > 0 &&
				<FriendsResult friends={friends} onClose={onClose} />
			}
			</div>
		</div>
	);
}

export default SearchFriends;