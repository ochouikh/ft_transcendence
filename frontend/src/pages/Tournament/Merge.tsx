function Merge({height}: {height: number}) {

	return (
		<div className="flex items-center w-full min-w-4" style={{height: `${height}px`}}>
			<span className="w-1/2 border-t border-b h-full border-r" />
			<span className="w-1/2 border-t" />
		</div>
	);
}

export default Merge;