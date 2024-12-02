function WaitingAction() {
	return (
		<div className="loader w-[142px] h-[40px] flex justify-center items-center rounded-md gap-2">
			<span className="rounded-full w-2 h-2 bg-white"></span>
			<span className="rounded-full w-2 h-2 bg-white"></span>
			<span className="rounded-full w-2 h-2 bg-white"></span>
		</div>
	);
}

export default WaitingAction;