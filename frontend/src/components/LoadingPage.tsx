function LoadingPage() {
	return ( 
		<div className="loader w-[100vw] h-[100vh] bg-bg flex justify-center items-center gap-2">
			<span className="rounded-full w-3 h-3 bg-white"></span>
			<span className="rounded-full w-3 h-3 bg-white"></span>
			<span className="rounded-full w-3 h-3 bg-white"></span>
		</div>
	);
}

export default LoadingPage;