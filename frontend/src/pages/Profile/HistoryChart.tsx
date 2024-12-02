import {  motion } from "framer-motion";
import { MatchesData } from "@/types/profile";

const HistoryChart = ({width, height, data}: {width: number, height: number, data: MatchesData[] | null}) => {
	let currentX = 0;
	let currentY = height * 50 / 100;
	let currentX2 = 0;
	let currentY2 = height * 50 / 100;


	return (
		<motion.svg width={width} height={height} viewBox={`-10 -10 ${width + 10} ${height+ 10}`} className="px-4 sm:px-10 md:px-12 lg:px-16 my-24 md:my-28"
			initial="hidden"
			animate="visible">

			<motion.circle
				cx={currentX}
				cy={currentY}
				r={3}
				className="fill-white stroke-primary stroke-1"
			/>
			{data && data.map((match: MatchesData, key: number) => {
				const saveX = currentX;
				const saveY = currentY;
				const n = match.goals - match.opponent.goals;
				currentX += width * 10 / 100;
				currentY = (height / 2) - (n * 10);
				const variant = {
					hidden: { pathLength: 0, opacity: 0 },
					visible: { pathLength: 1, opacity: 1 ,
						transition: { duration: 0.2, delay: key * 0.2},
						ease: "easeInOut"
					}
				}

				return (
					<motion.line
						key={key}
						x1={saveX}
						y1={saveY}
						x2={currentX}
						y2={currentY}
						className="stroke-primary stroke-1"
						variants={variant}
					/>
				);
			})}
			{data && data.map((match: MatchesData, key: number) => {
				const n = match.goals - match.opponent.goals;
				currentX2 += width * 10 / 100;
				currentY2 = (height / 2) - (n * 10);
				const variantCircle = {
					hidden: { pathLength: 0, opacity: 0 },
					visible: { pathLength: 1, opacity: 1 ,
						transition: { duration: 0.2, delay: key * 0.2},
					}
				}

				return (
					<motion.circle
						key={key}
						cx={currentX2}
						cy={currentY2}
						r={3}
						className="fill-white stroke-primary stroke-1"
						variants={variantCircle}
					/>
				);
			})}
		</motion.svg>
	)
}

export default HistoryChart;