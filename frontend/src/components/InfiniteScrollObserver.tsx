import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import api from "@/api/axios";

interface InfiniteScrollObserverProps {
	endPoint: string
	start?: number
	chunkSize?: number
	searchUsers?: boolean
	whenFetched?: (data?: any) => void
	whenError?: (error?: any) => void
}

function InfiniteScrollObserver({ endPoint, start = 0, chunkSize = 10, whenFetched, whenError, searchUsers }: InfiniteScrollObserverProps) {
	const container = useRef(null);
	const dataRange = useRef<number[]>([start, start + chunkSize]);
	const [isLimitReached, setIsLimitReached] = useState(false);

	const callback = async (entries: IntersectionObserverEntry[]) => {
		const element = entries[0];
		if (element.isIntersecting) {
			try {
				const start: string = searchUsers ? '&start=' : '/?start=';
				const data = await api.get(endPoint + start + dataRange.current[0] + '&end=' + dataRange.current[1]);
				if (!searchUsers && data.data.length == 0) {
					throw new Error('limit reached');
				}
				else if (searchUsers)
					setIsLimitReached(true);
				dataRange.current[0] += chunkSize;
				dataRange.current[1] += chunkSize;
				if (whenFetched) whenFetched(data.data);
			} catch (error) {
				setIsLimitReached(true);
				if (whenError) whenError([]);
			}
		}
	}

	useEffect(() => {
		if (!container.current) return;

		const obs = new IntersectionObserver(callback, {
			threshold: 0
		});
	
		obs.observe(container.current)
	
		return () => {
			if (!container.current) return;
			obs.unobserve(container.current);
		}
	}, [])

	return (
		<>
			{!isLimitReached && <div
				ref={container} className="h-[40px] flex justify-center items-center">
				<AiOutlineLoading3Quarters className='animate-spin' />
			</div>}
		</>
	);
}

export default InfiniteScrollObserver;