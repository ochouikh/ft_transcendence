import { PROFILE_OPTS, useProfileContext } from "@/contexts/profileStore";
import LevelBar from "./LevelBar";
import UserActions from "./UserActions";
import { useRef } from "react";
import api from "@/api/axios";
import { useParams } from "react-router-dom";
import edit_icon from "/edit_icon.svg"
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";

export const ProfileHeaderSkeleton = () => {
	return (
		<>
			<div className="relative mb-[200px] xl:mb-[50px] flex flex-col w-full animate-pulse">
				<div
					className="w-full h-[209px] rounded-md bg-[#2F2F2F]">
				</div>
				<div className="absolute left-1/2 xl:left-[15%] top-full translate-y-[-60px] -translate-x-1/2 flex flex-col justify-center items-center">
					<div className="relative rounded-full border-2 border-primary w-[120px] h-[120px] mb-3 bg-[#2F2F2F] overflow-hidden" />
					<div className="flex flex-col mb-5">
						<span className="h-[24px] w-[80px] bg-[#2F2F2F] rounded-full" />
					</div>
					<div className="w-[142px] h-[40px] bg-[#2F2F2F] rounded-md" />
				</div>
			</div>
			<div className="w-full flex flex-col justify-between xl:w-[585px] 2xl:w-[685px] animate-pulse">
				<div className="flex justify-between mb-2">
					<span className="w-[38px] h-[24px] bg-[#2F2F2F] rounded-full" />
					<span className="w-[38px] h-[24px] bg-[#2F2F2F] rounded-full" />
				</div>
				<div className="level-bar w-full bg-[#2F2F2F] h-[18px]" />
			</div>
		</>
	)
}

const ProfileHeader = () => {
	const { dispatch } = useGlobalContext();
	const { state, dispatchProfile } = useProfileContext();
	const { id } = useParams();
	const formRef = useRef<HTMLFormElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const changehandler = async (e: any) => {
		try {
			const newImage = e.currentTarget.files[0];
			if (!newImage) return ;
			else if (newImage.size > 1048576) {
				dispatch({type: STORE_OPTS.ALERT, message: "failed: Maximum file size is 1MB.", isError: true, dispatch});
				return ;
			}
			const formData = new FormData(formRef.current as HTMLFormElement | undefined);
			const res = await api.post("upload-avatar/", formData);
			
			if (res.status === 200)
			{
				dispatch({type: STORE_OPTS.ALERT, message: "Profile image changed successfuly.", dispatch});
				dispatchProfile({type: PROFILE_OPTS.USER_DATA, userData: {...state.userData, profile_image: res.data.url}});
			}
		} catch (err: any) {
			dispatch({type: STORE_OPTS.ALERT, message: err.response.data.error, isError: true, dispatch});
		} finally {
			inputRef.current && (inputRef.current.value = '');
		}
	}

	return (
		<>
			<div className="relative mb-[200px] xl:mb-[50px] flex flex-col w-full">
				<div
					style={{backgroundImage: `url(${state.userData?.level.image})`}}
					className="w-full h-[209px] rounded-md bg-cover bg-center bg-no-repeat overflow-hidden">
				</div>
				<div className="absolute left-1/2 xl:left-[15%] top-full translate-y-[-60px] -translate-x-1/2 flex flex-col justify-center items-center">
					<div style={{backgroundImage: `url(${state.userData?.profile_image})`}} className="relative rounded-full border-2 border-primary w-[120px] h-[120px] mb-3 bg-cover overflow-hidden">
						{
							(!id) &&
							<form ref={formRef} className="duration-300 hover:opacity-100 opacity-0 w-full h-full bg-[#000000CC]">
								<label htmlFor="avatar_link" className="absolute -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2 cursor-pointer"><img src={edit_icon} alt="EDIT" width={32} height={32} /></label>
								<input ref={inputRef} onChange={(e) => changehandler(e)} type="file" name="avatar_link" accept="image/*" id="avatar_link" className="hidden" />
							</form>
						}
					</div>
					<div className="flex flex-col mb-5">
						<span className="text-center">{state.userData?.username}</span>
						{
							(id && state.userData?.relation !== 'you') &&
							<div className="flex justify-center items-center gap-1">
								{
									state.userData?.online &&
									<>
										<span className="font-thin text-[12px]">online</span>
										<span className="w-[8px] h-[8px] rounded-full bg-[#1ED947]"></span>
									</>
								}
							</div>
						}
					</div>
					<UserActions isProfile={id === undefined} />
				</div>
			</div>
			<LevelBar current={state.userData ? state.userData.level.current : 0} progress={state.userData ? state.userData.level.progress : 0} />
		</>
	)
}

export default ProfileHeader;