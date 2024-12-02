import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends ComponentProps<'div'> {
	children: string
	firstCharClassName?: string
	restWordClassName?: string
	className?: string
	shadow?: boolean
	shadowVariant?: 'primary' | 'white' | 'red' | 'green'
}

function Title({ 
	children, 
	className, 
	firstCharClassName, 
	restWordClassName, 
	shadow = true,
	shadowVariant = 'primary',
	...props }: Props) {
	const words = children.split(' ');
	return ( 
		<div 
			className={className}
			{...props}
			>
			{
				words.map((word, index) => {
					const firstChar = word.charAt(0);
					const restWord = word.slice(1);
					return (
						<div key={index} className="inline">
							<span className={twMerge('font-semibold italic uppercase', firstCharClassName)}>{firstChar}</span>
							<span className={twMerge('font-semibold italic uppercase', restWordClassName)}>{restWord}</span>
							{index != words.length - 1 && <span className={twMerge('font-semibold italic uppercase', restWordClassName)}>{' '}</span>}
						</div>
					)
				})
			}
		</div>
	 );
}

export default Title;