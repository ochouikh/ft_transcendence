const Ready = ({counter}: {counter:number}) => {
	return (
		<div className="flex flex-col justify-between items-center p-8 gap-4">
			<span className="text-primary font-semibold text-center text-[2vw] 2xl:text-[35px]">Get ready, the game will start after</span>
			<span className="font-semibold text-center text-[4.5vw] 2xl:text-[80px]">{counter}</span>
		</div>
	)
}

export default Ready;