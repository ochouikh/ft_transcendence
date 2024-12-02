import { Link } from "react-router-dom";
import Button from "@/components/Button";
import Title from "@/components/Title";


const PingPong = () => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 sm:h-[400px] bg-secondary rounded-md border-white">
			<div className="flex flex-col justify-between p-5 sm:p-10 space-y-8">
				<div className='space-y-8'>
					<div style={{textShadow: '0px 0 34px rgba(20,255,236,0.5)'}} >
						<Title
							firstCharClassName='text-4xl sm:text-5xl'
							restWordClassName="text-2xl sm:text-3xl md:text-4xl"
								>Ping Pong
						</Title>
					</div>
					<p>Jump into a fast-paced ping pong match and challenge players or the AI. Play solo or with friends, and refine your skills with every match!</p>
				</div>
				<div>
					<Link to="/ping-pong">
						<Button className="h-full w-full max-w-[340px]">Start a game</Button>
					</Link>
				</div>
			</div>
			<div className="hidden sm:block grow shrink-0 bg-login bg-no-repeat bg-cover bg-top">
				<div className="w-full h-full bg-gradient-to-l from-transparent to-secondary"></div>
			</div>
		</div>
	)
}

export default PingPong;