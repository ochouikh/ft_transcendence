import { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { tableColors } from "../CustomizeTab";

interface TableProps { 
	tableColor?: string, 
	setTableColor: Dispatch<SetStateAction<string | undefined>> 
	ballColor?: string, 
	paddleColor?: string, 
}

function Table({ tableColor, setTableColor, ballColor, paddleColor }: TableProps) {
	const [colorIndex, setColorIndex] = useState(tableColors.indexOf(tableColor || tableColors[0]));

	const goForward = () => {
		setColorIndex((prevIndex) => (prevIndex + 1) % tableColors.length);
	  }
	
	  const goBackward = () => {
		setColorIndex((prevIndex) => (prevIndex - 1 + tableColors.length) % tableColors.length)
	  }
	
	  useLayoutEffect(() => {
		setTableColor(tableColors[colorIndex]);
	  }, [colorIndex])
	
	return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-10">
			<button 
				onClick={goBackward}
				className="hidden md:grid size-10 border border-border rounded-md place-items-center">
				<IoIosArrowBack className="text-xl" />
			</button>
			<div
				style={{backgroundColor: tableColor + '1a'}} 
				className="w-full relative flex-1 aspect-video border border-border rounded-md max-w-[1080px] duration-300">
					<span
						style={{backgroundColor: (paddleColor ? paddleColor : "#FFFFFF")}} 
						className="absolute top-[10%] left-3 w-[2.5%] max-w-4 aspect-[0.2/1] rounded-full" />
					<svg className="absolute w-[37.38%] h-full left-1/2 -translate-x-1/2">
					<line x1={'100%'} x2={'0%'} y1={'0%'} y2={'100%'} className="stroke-1 stroke-border" />
					</svg>
					<span
						style={{backgroundColor: (paddleColor ? paddleColor : "#FFFFFF")}} 
						className="absolute top-[60%] right-3 w-[2.5%] max-w-4 aspect-[0.2/1] rounded-full" />
					<span
						style={{backgroundColor: (ballColor ? ballColor : "#FFFFFF")}}  
						className="absolute top-[40%] right-[30%] w-[3%] max-w-6 aspect-square rounded-full"></span>
			</div>
            <div className="w-full md:w-auto flex justify-between">
                <button 
                    onClick={goBackward}
                    className="md:hidden size-10 border border-border rounded-md grid place-items-center">
                    <IoIosArrowBack className="text-xl" />
                </button>
                <button 
                    onClick={goForward}
                    className="size-10 border border-border rounded-md grid place-items-center">
                    <IoIosArrowForward className="text-xl" />
                </button>
            </div>
		</div>
	)
}

export default Table;