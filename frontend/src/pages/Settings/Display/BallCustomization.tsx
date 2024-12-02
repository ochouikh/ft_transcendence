import { Dispatch, SetStateAction, useState } from "react";
import DropMenu from "./DropMenu";
import { ballColors } from "../CustomizeTab";

interface BallCustomizationProps { 
	ballColor?: string, 
	setBallColor: Dispatch<SetStateAction<string | undefined>> 
}

function BallCustomization({ ballColor, setBallColor }: BallCustomizationProps) {
	const [dropMenu, setDropMenu] = useState(false);

	return (
		<div className="flex items-center gap-5 z-10">
			<span>ball:</span>
			<button className="relative size-10 border border-border hover:border-white duration-300 rounded-md grid place-items-center">
				<span onClick={() => setDropMenu(prev => !prev)} className="size-5 rounded-full" style={{backgroundColor: (ballColor ? ballColor : "#FFFFFF")}}/>
				<DropMenu isOpen={dropMenu} className="w-[200%] grid grid-cols-2">
					{
						ballColors.map((color, index) => {
							return (
									<span key={index} onClick={() => {
										setDropMenu(false);
										setBallColor(color)
									}
								} className="size-5 rounded-full cursor-pointer" style={{backgroundColor: color}}/>
							)
						})
					}
				</DropMenu>
			</button>
		</div>
	)
}

export default BallCustomization;