import { LegacyRef, forwardRef, useRef, useState } from "react";
import { CgEye } from "react-icons/cg";
import { useGlobalWebSocketContext } from "@/contexts/globalWebSokcketStore";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";

interface Props {
	type: "current" | "newPass" | "reTypeNew",
	error: boolean,
}

const EditBar = forwardRef((props: Props, ref: LegacyRef<HTMLInputElement>) => {
	const [display, setDisplay] = useState<boolean>(false);

	return (
		<div className="relative max-w-96 h-full w-full">
			<input ref={ref} type={display ? "text" : "password"} className={"w-full border outline-none py-3 px-4 h-full rounded-[5px] bg-transparent " + ((props.error) ? "border-red-600" : "border-border")}
			placeholder={props.type === "current" ? "Current password" : (props.type === "newPass" ? "New password" : "Re-type new password")} />
			<CgEye onClick={() => setDisplay(!display)} className="absolute -translate-y-1/2 -translate-x-full left-[96%] top-1/2 text-lg" />
		</div>
	)
})

function ChangePassword() {
	const current = useRef<HTMLInputElement>(null);
	const newPass = useRef<HTMLInputElement>(null);
	const reTypeNew = useRef<HTMLInputElement>(null);
	const [currentError, setCurrentError] = useState<boolean>(false);
	const [newError, setNewError] = useState<boolean>(false);
	const [reTypeNewError, setReTypeNewError] = useState<boolean>(false);
	const {sendJsonMessage} = useGlobalWebSocketContext();
	const [display, setDisplay] = useState<boolean>(false);

	const clickHandler = () => {
		(current.current?.value != '') ? setCurrentError(false) : setCurrentError(true);
		(newPass.current?.value != '') ? setNewError(false) : setNewError(true);
		(reTypeNew.current?.value != '') && (newPass.current?.value == reTypeNew.current?.value) ? setReTypeNewError(false) : setReTypeNewError(true);
		if ((reTypeNew.current?.value != '') && (newPass.current?.value != '') && (current.current?.value != '')
			&& (newPass.current?.value == reTypeNew.current?.value))
		{	
			sendJsonMessage({
				type: "update",
				identifier: "password",
				data: {
					old_password: current.current?.value,
					new_password: newPass.current?.value
				}
			});
			current.current && (current.current.value = '');
			newPass.current && (newPass.current.value = '');
			reTypeNew.current && (reTypeNew.current.value = '');
		}
	}

	return (
		<div className="flex flex-col gap-2 justify-between">
			<div className="flex justify-between items-center">
				<span className="font-medium">Change your password:</span>
				<MdOutlineKeyboardArrowUp onClick={() => setDisplay(!display)} className={"text-3xl duration-200 " + (display ? "rotate-0" : "rotate-180")}/>
			</div>
			{
				display &&
				<div className="flex flex-col gap-5">
					<EditBar ref={current} type="current" error={currentError}/>
					<EditBar ref={newPass} type="newPass" error={newError}/>
					<EditBar ref={reTypeNew} type="reTypeNew" error={reTypeNewError}/>
					<span onClick={clickHandler} className="cursor-pointer hover:underline duration-300 select-none self-end">save new password</span>
				</div>
			}
		</div>
	)
}

export default ChangePassword;