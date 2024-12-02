import UP from '/UP.svg'
import DOWN from '/DOWN.svg'
import W from '/W.svg'
import S from '/S.svg'
import PADDEL_DIRECTIONS from '/PADDEL_DIRECTIONS.svg'
import MOVE_UP from '/MOVE_UP.svg'
import MOVE_DOWN from '/MOVE_DOWN.svg'
import { isMobile } from 'react-device-detect';

const Help = () => {
	return (
		<div className="p-8 space-y-8 w-full">
			<div className="text-primary font-semibold text-center 2xl:text-[25px] text-[1.5vw]">How to play?</div>
			{
				isMobile ?
				<div className='flex justify-between w-full gap-3'>
					<div className="flex flex-col justify-between gap-1 sm:gap-2 max-h-full">
						<span className="font-normal font-montserrat 2xl:text-[29px] text-[1.2vw]">use these buttons to move the paddle up and down</span>
						<div className="flex items-center sm:gap-2 gap-1">
							<img src={MOVE_UP} alt="MOVE UP" className='max-w-10 w-[3vw]' />
							<img src={MOVE_DOWN} alt="MOVE DOWN" className='max-w-10 w-[3vw]' />
						</div>
					</div>
					<img src={PADDEL_DIRECTIONS} alt="PADDEL" className='w-[4.5vw] max-w-16' />
				</div>
				:
				<div className='flex flex-col justify-between items-center w-full sm:gap-4 gap-2'>
					<span className="text-primary font-semibold text-center 2xl:text-[25px] text-[1.5vw]">or</span>
					<div className="flex justify-between items-center w-full">
						<div className="flex flex-col justify-center items-center w-full sm:gap-2 gap-1">
							<img src={W} alt="KEY W" className='w-[4.5vw] max-w-16' />
							<img src={S} alt="KEY S" className='w-[4.5vw] max-w-16' />
						</div>
						<img src={PADDEL_DIRECTIONS} alt="PADDEL" className='w-[4.5vw] max-w-16' />
						<div className="flex flex-col justify-between items-center w-full sm:gap-2 gap-1">
							<img src={UP} alt="KEY UP" className='w-[4.5vw] max-w-16' />
							<img src={DOWN} alt="KEY DOWN" className='w-[4.5vw] max-w-16' />
						</div>
					</div>
				</div>
			}
		</div>
	)
}

export default Help;