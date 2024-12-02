import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface UserProps extends HTMLAttributes<HTMLDivElement> {
	border?: boolean,
	style?: CSSProperties,
	url: string | undefined
	online?: boolean
	className?: string
	children?: ReactNode
}

const User = ({border = false, style, url, online, className, children, ...props}: UserProps) => {
	return (
		<div 
			className={twMerge(`${border ? 'border': ''} relative rounded-full bg-cover bg-center size-10`, className)}
			style={{
				backgroundImage: `url(${url})`,
			}}
			{...props}
			>
				{online && <span className="absolute bottom-0 right-0 w-[10px] h-[10px] bg-green-500 rounded-lg"></span>}
				{children}
        </div>
	);
}

export default User;