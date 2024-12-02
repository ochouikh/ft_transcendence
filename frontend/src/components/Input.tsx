import { CSSProperties, HTMLInputTypeAttribute, InputHTMLAttributes, LegacyRef, useRef, useState } from "react";
import { CgEye } from "react-icons/cg";
import { twMerge } from "tailwind-merge";

type TOnBlur = (e?: any) => void

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	height?: number | string
	style?: CSSProperties
	className?: string
	type: HTMLInputTypeAttribute,
	onBlur?: TOnBlur,
	onFocus?: TOnBlur
}

const Input = ({height = 48, style, className, type, onBlur, onFocus, ...props  } : InputProps ) => {
	const [showPassword, setShowPassword] = useState(false);
	const inputRef: LegacyRef<HTMLInputElement> = useRef<HTMLInputElement>(null)

	return (
		<div className="relative w-full">
			<input
				ref={inputRef}
				type={type != 'password' ? type : showPassword ? 'text' : 'password'}
				className={twMerge("bg-secondary border border-transparent focus:border-primary font-normal px-3 rounded-[5px] focus:outline-none duration-300",className)}
				style={{height, ...style}}
				{...props}
				onFocus={() => { 
					if (onFocus) onFocus();
				}}
				onBlur={() => {
					if (onBlur) onBlur();
				}}
			/>
			{/* <span className={isFocus ? "px-2 absolute text-[12px] top-[-9px] left-[15px] text-primary bg-bg duration-200" : "pointer-events-none px-3 absolute top-[11px] left-0 text-gray1 opacity-50 duration-200" } >{placeholder}</span> */}
			{
				type == 'password' && inputRef.current && inputRef.current.value != '' &&
				<span 
					className="absolute h-3/4 aspect-square bg-secondary right-2 top-1/2 -translate-y-1/2 cursor-pointer flex justify-center items-center select-none"
					onClick={() => setShowPassword(prev => !prev)}
					>
						<CgEye className="text-lg" />
				</span>}
		</div>
	);
}

export default Input;