import { useNavigate } from "react-router-dom";

function GoToProfile() {
	const navigate = useNavigate();

	return (
		<div onClick={() => navigate("/profile")} className="w-[142px] h-[40px] bg-secondary rounded-md flex justify-center items-center gap-1 cursor-pointer select-none">
			<span>go to profile</span>
		</div>
	);
}

export default GoToProfile;