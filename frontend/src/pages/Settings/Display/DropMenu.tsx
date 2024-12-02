import { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface DropMenuProps extends ComponentProps<'div'> {
	children?: ReactNode
	className?: string
	isOpen?: boolean
}

function DropMenu({ children, className, isOpen = false }: DropMenuProps) {
	if (!isOpen) return null;
	return (
		<div className={twMerge("absolute top-full mt-5 p-3 left-0 bg-secondary border border-border rounded-md flex flex-col gap-3", className)}>
			{children}
		</div>
	)
}

export default DropMenu;