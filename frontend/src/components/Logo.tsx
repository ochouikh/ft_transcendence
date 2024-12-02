import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const ANIMATION_TIME = 100;

interface Props extends ComponentProps<'h1'> {
	className?: string
	animate?: boolean
	responsive?: boolean
}

function Logo({className, animate = false, responsive = false, ...props}: Props) {
	const letters = 'RANSENDENCE'.split('');
	return ( 
		<h1 
			className={twMerge("uppercase font-bold overflow-y-hidden", className)}
			{...props}>
			<span
				style={animate ? {
					animationDelay: ANIMATION_TIME + 'ms'
				} : {}} 
				className={"font-myFont text-primary" + (animate ? ' logo -translate-y-full inline-block' : '')}>T</span>
			{!animate && <span className={responsive ? "hidden sm:inline" : ""}>RANSENDENCE</span>}
			{animate && <span className={responsive ? "hidden sm:inline" : ""}>
				{
					letters.map((letter, index) => {
						return (
							<span key={index}
								style={{animationDelay: ((index + 2) * ANIMATION_TIME) + 'ms'}}
								className="logo -translate-y-full inline-block">{letter}</span>
						)
					})
				}
			</span>}
		</h1>
	);
}

export default Logo;