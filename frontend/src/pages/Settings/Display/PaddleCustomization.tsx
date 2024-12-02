import { Dispatch, SetStateAction, useState } from "react";
import DropMenu from "./DropMenu";
import { paddleColors } from "../CustomizeTab";

interface PaddleCustomizationProps { 
	paddleColor?: string, 
	setPaddleColor: Dispatch<SetStateAction<string | undefined>> 
}

function PaddleCustomization({ paddleColor, setPaddleColor }: PaddleCustomizationProps) {
	const [ dropMenu, setDropMenu ] = useState(false);

	return (
		<div className="flex items-center gap-5">
			<span>paddle:</span>
			<button className="relative h-10 w-36 border border-border hover:border-white duration-300 rounded-md grid place-items-center px-3">
				<span onClick={() => setDropMenu(prev => !prev)} className="w-full h-5 rounded-2xl" style={{backgroundColor: (paddleColor ? paddleColor : "#FFFFFF")}}/>
				<DropMenu isOpen={dropMenu} className="w-full">
					{
						paddleColors.map((color, index) => {
							return (
									<span key={index} onClick={() => {
										setDropMenu(false);
										setPaddleColor(color)
									}
								} className="w-full h-5 rounded-2xl cursor-pointer" style={{backgroundColor: color}}/>
							)
						})
					}
				</DropMenu>
			</button>
		</div>
	)
}

export default PaddleCustomization;