import { twMerge } from "tailwind-merge";
import Title from "@/components/Title";

interface Props {
	image?: string
	children?: string
	className?: string
}

function LayoutHeader({ children, className }: Props) {
	return ( 
		<div className={twMerge("h-[110px] bg-secondary rounded-xl grid grid-cols-2 mb-10 overflow-hidden", className)}>
			<div
				style={{textShadow: '0px 0 34px rgba(20,255,236,0.5)'}} 
				className="flex items-center pl-10 z-10">
				<Title firstCharClassName="text-3xl md:text-5xl" restWordClassName="text-2xl md:text-4xl">{ String(children) }</Title>
			</div>
			<div className="size-full relative">
				<div className="absolute top-0 left-0 size-full bg-login bg-cover" />
				<div className="absolute top-0 left-0 size-full bg-gradient-to-r from-secondary to-transparent" />
			</div>
		</div>
	);
}

export default LayoutHeader;