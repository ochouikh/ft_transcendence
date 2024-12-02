import { ReactNode } from "react";

interface Props {
	children?: ReactNode
	className?: string
	childClassName?: string
}
function Container({children, className, childClassName, ...props}: Props) {
	return ( 
		<div className={'bg-secondary rounded-md' + (className ? ` ${className}` : '')} {...props}>
			<div className={'rounded-md border border-border w-full h-full bg-gradient' + (childClassName ? ` ${childClassName}` : '')}>
				{children}
			</div>
		</div>
	);
}

export default Container;