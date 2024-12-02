import { motion } from "framer-motion";
import { ComponentProps, useEffect, useState } from "react";
import Container from "@/components/Container";
import { useProfileContext } from "@/contexts/profileStore";

export const StatesSkeleton = () => {
	return (
		<div className="row-span-3 row-start-2 xl:row-span-1 xl:row-start-1 xl:col-start-1 xl:col-end-4 animate-pulse">
			<Container className="h-full" childClassName="flex flex-col justify-between p-5 sm:p-10 gap-20">
				<div className="">
					<h1 className="self-start text-2xl font-semibold mb-3">States</h1>
					<div className="flex flex-col sm:flex-row gap-3 sm:justify-between w-full">
						<span className="w-[90px] h-[28px] rounded-full bg-[#2F2F2F]" />
						<div className='flex flex-col sm:flex-row sm:items-center gap-5'>
							<div className="flex gap-3 text-xl items-center">
								<span className="w-[20px] h-[20px] bg-primary"></span>
								<span className="w-[66px] h-[28px] bg-[#2F2F2F] rounded-full" />
							</div>
							<div className="flex gap-3 text-xl items-center">
								<span className="w-[20px] h-[20px] bg-dark"></span>
								<span className="w-[66px] h-[28px] bg-[#2F2F2F] rounded-full" />
							</div>
						</div>
					</div>
				</div>
				<div className="relative w-full aspect-square max-w-[300px] self-center rounded-full sm:shrink-0"
					style={{ background: `conic-gradient(from -90deg, #2F2F2F 0%, #2F2F2F 100%)` }}>
					<div className="absolute inset-[20%] sm:inset-[60px] rounded-full bg-bg"></div>
				</div>
			</Container>
		</div>
	)
}

const WinsAndLoses = ({total, wins}: {total?: number, wins?: number}) => {
	const loss: number = (total ? total : 0) - (wins ? wins : 0);

	return (
		<div className='flex flex-col sm:flex-row sm:items-center gap-5'>
			<div className="flex gap-3 text-xl items-center">
				<span className="w-[20px] h-[20px] bg-primary"></span>
				<h3>{wins} wins</h3>
			</div>
			<div className="flex gap-3 text-xl items-center">
				<span className="w-[20px] h-[20px] bg-dark"></span>
				<h3>{loss} losses</h3>
			</div>
		</div>
	)
}
interface NisbaProps extends ComponentProps<'span'> {
	percentage: number,
	className: string
}

const Nisba = ({percentage, className, ...props}: NisbaProps) => {
	const [nisba, setNisba] = useState<number>(0);

	useEffect(() => {
		if (nisba == percentage) return ;
		const timeout = setTimeout(() => {
			if (nisba < percentage) setNisba((prev) => prev + 1.00);
			else if (nisba > percentage) setNisba((prev) => prev - 1.00);
		}, 30);
		return () => clearTimeout(timeout);

	}, [nisba, percentage])

	return (
		<span {...props} className={"text-primary text-3xl " + className}>{nisba + '%'}</span>
	)
}

const States = () => {
	const { state } = useProfileContext();
	const [percentage, setPercentage] = useState<string>(state.userData ? (state.userData.matches.total != 0 ? parseFloat(((state.userData.matches.wins / state.userData.matches.total) * 100).toString()).toFixed(0) : 0) + '%' : '0%');

	useEffect(() => {
		setPercentage(state.userData ? (state.userData.matches.total != 0 ? parseFloat(((state.userData.matches.wins / state.userData.matches.total) * 100).toString()).toFixed(0) : 0) + '%' : '0%');
	}, [state.userData]);

	return (
		<div className="row-span-3 row-start-2 xl:row-span-1 xl:row-start-1 xl:col-start-1 xl:col-end-4">
			<Container className="h-full" childClassName="flex flex-col justify-between p-5 sm:p-10 gap-20">
				<div className="">
					<h1 className="self-start text-2xl font-semibold mb-3">States</h1>
					<div className="flex flex-col sm:flex-row gap-3 sm:justify-between w-full">
						<h3 className="text-xl">games: {state.userData?.matches.total}</h3>
						<WinsAndLoses total={state.userData?.matches.total} wins={state.userData?.matches.wins} />
					</div>
				</div>
				<motion.div
					initial={{background: `conic-gradient(from -90deg, 
						var(--primary-color) 0%, 
						var(--primary-color) ${'0%'}, 
						var(--dark-color) ${'0%'}, var(--dark-color) 100%)`}}
						animate={{background: `conic-gradient(from -90deg, 
							var(--primary-color) 0%, 
							var(--primary-color) ${percentage}, 
							var(--dark-color) ${percentage}, var(--dark-color) 100%)`}}
							transition={{
								duration: 2,
								ease: 'easeOut'
							}}
							className="relative w-full aspect-square max-w-[300px] self-center rounded-full sm:shrink-0"
							style={{
								background: `conic-gradient(from -90deg, 
									var(--primary-color) 0%, 
									var(--primary-color) ${percentage}, 
									var(--dark-color) ${percentage}, var(--dark-color) 100%)`
								}}
								>
					<div className="absolute inset-[20%] sm:inset-[60px] rounded-full bg-bg" />
					<Nisba className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" percentage={parseFloat(percentage)}/>
				</motion.div>
			</Container>
		</div>
	)
}

export default States;