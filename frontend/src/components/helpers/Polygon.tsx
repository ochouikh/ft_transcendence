import { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface PolygonProps extends HTMLAttributes<HTMLDivElement> {
	children?: ReactNode,
	className?: string,
	disabled?: boolean
}

const Polygon = ({children, className, disabled, ...props}: PolygonProps) => {
	return (
		<div 
			className={
				twMerge("polygon px-10 h-[42px] flex justify-center items-center text-bg font-semibold relative z-10 " + (disabled ? 'cursor-not-allowed' : 'cursor-pointer'), className)
			}
			{...props}
		>
			{children}
		</div>
	)
}

export default Polygon;