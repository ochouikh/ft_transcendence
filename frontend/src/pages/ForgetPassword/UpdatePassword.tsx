import { FormEvent, useRef, useState } from "react";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import axios from "axios";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { validate } from "@/utils/validation";
import { API_END_POINT } from "@/utils/urls";

interface Props {
	token: string
}

function UpdatePassword({ token }: Props) {
	const navigate = useNavigate();
	const password = useRef<string>('');
	const retypePassword = useRef<string>('');
	const [error, setError] = useState({
		password: false,
		confirmationPassword: false,
		message: ''
	})
	
	const { state, dispatch } = useGlobalContext();
	const submitHandler = async (e: FormEvent) => {
		try {
			dispatch({type: STORE_OPTS.LOADING, state: true})
			e.preventDefault();
			if (!validate('password', password.current)) {
				throw {
					invalid: true,
					message: 'Invalid Password Regex'
				}
			}
			else if (password.current != retypePassword.current) {
				throw {
					invalid: true,
					message: 'Mismatch Passwords'
				}
			}
			await axios.post(API_END_POINT + 'update-password/', {
				token: token,
				data :
				{
					password: password.current,
					retype_password: retypePassword.current
				}
			})
			navigate('/login');
		} catch (error: any) {
			setError({
				password: true,
				confirmationPassword: true,
				message: error?.response?.data?.error?.message || error.message
			})
		}
		dispatch({type: STORE_OPTS.LOADING, state: false})
    }

	return ( 
		<>
			<h1 className="text-2xl text-center font-semibold mb-14 italic">Update Password</h1>
			<form onSubmit={submitHandler} className="flex flex-col justify-between w-full h-[240px]">
				<div className="flex flex-col gap-5 w-full mb-5">
					<Input
						onChange={(e) => {
							password.current = e.target.value
							setError(prev => {
								return {
									...prev, 
									password: false
								}
							})
						}}
						className="w-full"
						type='password'
						placeholder='password'
						style={ error.password ? { borderColor:  'var(--invalid-color)', color: 'var(--invalid-color)'} : {}}
					/>
					<Input
						onChange={(e) => {
							retypePassword.current = e.target.value
							setError(prev => {
								return {
									...prev, 
									confirmationPassword: false
								}
							})
						}}
						className="w-full"
						type='password'
						placeholder='password confirmation'
						style={ error.confirmationPassword ? { borderColor:  'var(--invalid-color)', color: 'var(--invalid-color)'} : {}}
					/>
					{(error.password || error.confirmationPassword) && <p className="text-sm self-end text-invalid">{error.message}</p>}
				</div>
				<Button 
					type="submit"
					disabled={state.isLoading}
					onClick={submitHandler}
					className="mt-5"
					>
						Update
				</Button>
			</form>
			<Loading />
		</>
	 );
}

export default UpdatePassword;