import { useNavigate } from "react-router-dom";
import edit_icon from "/edit_icon.svg"

const EditProfile = () => {
	const navigate = useNavigate();

	return (
		<div onClick={ () => navigate('/settings') } className="w-[142px] h-[40px] bg-secondary rounded-md flex justify-center items-center gap-1 cursor-pointer select-none">
			<span>edit profile</span>
			<img src={edit_icon} alt="EDIT" width={22} height={22}/>
		</div>
	)
}

export default EditProfile;