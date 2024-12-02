import { ComponentProps, FormEvent } from "react";

interface Props extends ComponentProps<'div'> {
	className?: string
}

function SearchBar({ className }: Props) {
	const handler = (e: FormEvent) => {
		e.preventDefault();
	}

	return ( 
		<form onSubmit={handler} className={"w-full border-b border-b-white h-[40px]" + (className ? ` ${className}` : '')}>
			<input type="text" placeholder="search" className="w-full h-full px-2 bg-secondary text-white focus:outline-none" />
		</form>
	);
}

export default SearchBar;