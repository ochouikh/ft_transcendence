import { Dispatch, useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import useInputChecker from "@/hooks/useInputChecker";
import callToApi from "@/api/callToApi";
import { useNavigate } from "react-router-dom";
import { API_END_POINT } from "@/utils/urls";

interface IBody {
	username: string,
	email: string,
	password: string,
	retype_password: string
}

interface IResponse {
	type: string,
	data: IBody
}

interface Props {
	dispatchLevel: Dispatch<React.SetStateAction<number>>
}

const UsernameForm = ({dispatchLevel}: Props) => {
	const [formError, setFormError] = useState<string>('');
	const [username, setUsername] = useState<string>('')
	const [ formState ] = useInputChecker(API_END_POINT + 'register/');
	const { dispatch } = useGlobalContext();
	const navigate = useNavigate();

	const submitHandler = async (e: any) => {
		e.preventDefault();

		const data: IResponse = {
			type: "normal",
			data : {
				username: username,
				email: '',
				password: '',
				retype_password: ''
			}
		}
		
		try {
			await callToApi('register/', data);
		}
		catch (error: any) {
			let errorMsg: string = '';
			if (typeof error == 'string') {
				errorMsg = error;
			}
			else {
				if (!error.error.message['username']) {
					dispatchLevel(0);
					navigate('/profile');
					
				} else {
					errorMsg = error.error.message['username']
				}
			}
			setFormError(errorMsg)
		}
		dispatch({type: STORE_OPTS.LOADING, state: false});
	}

	return (
		<>
			<h1 className="text-2xl font-semibold mb-14 italic">Create your username</h1>
			<form onSubmit={submitHandler} className="flex flex-col justify-between w-full h-[150px]">
				<Input
					onChange={(e) => setUsername(e.target.value)}
					className="w-full"
					type='username'
					placeholder='Username'
					style={formState[0].isError ? {
						borderColor:  'var(--invalid-color)',
						color: 'var(--invalid-color)'
					} : {}}
				/>
					{formError != '' && <p className="text-[12px] self-end text-invalid">{formError}</p>}
				<Button onSubmit={submitHandler} className="w-full">complete Sign up</Button>
			</form>
		</>
	)
}

export default UsernameForm;