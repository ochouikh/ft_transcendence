import { useState } from "react";
import EditBar from "./EditBar";
import { UpdateReq } from "@/types/profile";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";
import { useGlobalContext } from "@/contexts/store";

function TFA() {
	const {state} = useGlobalContext();
	const { sendJsonMessage } = useGlobalWebSocketContext();
	const [enableTFA, setEnableTFA] = useState<boolean | undefined>(state.userData?.tfa?.status);

	const makeReq = () => {
		if (state.userData?.tfa?.content === '')
			return ;
		const req : UpdateReq = {
			type: "update",
			identifier: "tfa-status",
			data: {
				value: !enableTFA,
			}
		}
		sendJsonMessage(req);
	}

	const clickHandler = () => {
		setEnableTFA(!enableTFA);
		makeReq();
	}

	return (
		<div className="flex flex-col gap-[19px]">
			<div className="flex justify-between items-center">
				<span className="font-medium">Two factor authentication</span>
				<div onClick={clickHandler} className={"relative w-[33px] h-[17px] rounded-[60px] border cursor-pointer " + ((enableTFA) ? "border-primary" : "")}>
					<span
					className={"absolute w-[19px] h-[19px] rounded-full top-[-2px] border border-secondary duration-300 "
					+ ((enableTFA) ? "left-[13px] bg-primary" : "left-[-1px] bg-white")}
					/>
				</div>
			</div>
			{
				(enableTFA) &&
				<>
					<span className="font-light">Enter an email to enable the 2FA and where we will sent you the otp code</span>
					<EditBar type="tfa"/>
				</>
			}
		</div>
	);
}

export default TFA;