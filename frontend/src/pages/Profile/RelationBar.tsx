import { forwardRef } from "react";

interface Props {
	width: number,
	active: boolean,
	name: string,
	onClick: any
}

const RelationBar = forwardRef((props: Props, ref: any) => {
	return (
		<div ref={ref} onClick={props.onClick} style={{width:`${props.width}px`}} className='relative h-[36px] flex flex-col justify-between items-center overflow-hidden select-none cursor-pointer'>
			{
				props.active ?
				<>
					<span className="duration-500 text-primary font-medium">{props.name}</span>
					<div className="duration-500 border-b border-primary w-full" />
				</>
				:
				<>
					<span className="duration-500 font-normal">{props.name}</span>
					<div className="duration-500 border-b border-primary w-full absolute top-full -translate-x-full" />
				</>
			}
		</div>
	)
})

export default RelationBar;