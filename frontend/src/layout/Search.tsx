import { FiSearch } from "react-icons/fi";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import Modal from "@/components/Modal";
import SearchUsers from "@/components/SearchUsers";

function Search() {
	const {state, dispatch} = useGlobalContext();
	
	return ( 
		<>
			<FiSearch
				onClick={() => dispatch({type: STORE_OPTS.SEARCH, state: true})} 
				className="text-2xl lg:hidden cursor-pointer" />
			<div 
				onClick={() => dispatch({type: STORE_OPTS.SEARCH, state: true})} 
				className="hidden lg:flex items-center text-gray1 h-10 pl-4 pr-32 rounded-md cursor-pointer border border-border">search</div>
			<Modal
				className='top-20 translate-y-0 w-11/12 max-w-[600px]'
				isOpen={state.search} 
				onClose={() => dispatch({type: STORE_OPTS.SEARCH, state: false})}>
				<SearchUsers />
			</Modal>
		</>
	);
}

export default Search;