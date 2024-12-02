import { HTMLAttributes, ReactNode } from "react";
import Polygon from "./helpers/Polygon";

interface ButtonProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode,
	className?: string,
	type?: 'submit'
	disabled?: boolean
}

const Button = ({children, className, type, disabled = false, ...props}: ButtonProps) => {
	return (
		<button
			disabled={disabled}
			type={type || 'button'} className={"relative group select-none " + (className ? ' ' + className : '')}>
			<Polygon
				disabled={disabled}
				className={"bg-primary duration-200 italic overflow-hidden"}
				{...props}
			>
				{!disabled && <Polygon
					className={"bg-white absolute -z-10 top-0 -left-full group-hover:left-full duration-300 w-full italic"}
					{...props}
				/>}
				{children}
			</Polygon>
			<div className={"polygon-border absolute top-[8px] left-[5px] w-full px-10 h-[42px] bg-white font-semibold " + (disabled ? 'cursor-not-allowed' : 'cursor-pointer')}></div>
		</button>
	)
}

export default Button;