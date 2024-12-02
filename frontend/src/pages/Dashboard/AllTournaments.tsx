import Container from "@/components/Container";

function AllTournaments() {
	return (
		<div className="flex flex-col gap-5 pb-8">
			<Container className="w-full h-[75px]" childClassName="flex justify-between items-center p-10">
				<span>Tournament title 4/8</span>
			</Container>
			<Container className="w-full h-[75px]" childClassName="flex justify-between items-center p-10">
				<span>Tournament title 4/8</span>
			</Container>
			<Container className="w-full h-[75px]" childClassName="flex justify-between items-center p-10">
				<span>Tournament title 4/8</span>
			</Container>
		</div>
	);
}

export default AllTournaments;