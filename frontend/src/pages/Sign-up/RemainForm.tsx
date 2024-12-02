import { Dispatch, useEffect, useState } from "react";
import Input from "@/components/Input";
import { useNavigate } from "react-router-dom";
import useInputChecker from "@/hooks/useInputChecker";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import callToApi from "@/api/callToApi";
import Button from "@/components/Button";
import { API_END_POINT } from "@/utils/urls";
import Loading from "@/components/Loading";

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
	email: string,
	dispatchLevel: Dispatch<React.SetStateAction<number>>
}

const RemainForm = ({email}: Props) => {
	const [formError, setFormError] = useState<string>('');
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [retypePassword, setRetypePassword] = useState<string>('');
	const [submit, setSubmit] = useState<boolean>(false);
	const { state, dispatch } = useGlobalContext();
	const navigate = useNavigate();
	const [formState, parseInput, makeRequest] = useInputChecker(API_END_POINT + 'register/');

	useEffect(() => {
		if (!submit) return;
		submitForm();
		setSubmit(false);
	}, [submit])

	const blurHandler = (index: number, type: string) => {
		const data: IResponse = {
			type: "normal",
			data : {
				username: type == 'username' ? username : '',
				email: type == 'email' ? email : '',
				password: type == 'password' ? password : '',
				retype_password: type == 'retype_password' ? retypePassword : ''
			}
		}
		if (!formState[index].isError) {
			makeRequest(data, type);
		}
	}

	useEffect(() => {
		let i: number;
		for (i = 0; i < formState.length; i++) {
			if (formState[i].isError) {
				setFormError(formState[i].error)
				break ;
			}
		}
		if (i == formState.length) setFormError('');
	}, [formState])

	const submitForm = async () => {
		dispatch({type: STORE_OPTS.LOADING, state: true})
		const data: IResponse = {
			type: "normal",
			data : {
				username: username,
				email: email,
				password: password,
				retype_password: retypePassword
			}
		}
		
		try {
			await callToApi('register/', data);
			navigate('/login');
		}
		catch (error: any) {
			setFormError(error)
		}
		dispatch({type: STORE_OPTS.LOADING, state: false});
	}

	const submitHandler = async (e: any) => {
		e.preventDefault();

		for (let i = 0; i < formState.length; i++) {
			if (formState[i].isError) return;
		}

		parseInput('username', username);
		parseInput('password', password);
		parseInput('retype_password', retypePassword, password);
		
		if (username == '' || email == '' || password == '' || retypePassword == '') return;

		setSubmit(true);
		dispatch({type: STORE_OPTS.LOADING, state: true});
	}

	return (
		<>
			<h1 className="text-2xl font-semibold mb-14 italic">Your are a step away...</h1>
			<form onSubmit={submitHandler} className="flex flex-col justify-between w-full h-[350px]">
				<div className="flex flex-col gap-5 w-full">
				<>
					<Input
						onChange={(e) => {
							setUsername(e.target.value)
							parseInput('username', e.target.value);
						}}
						onBlur={() => blurHandler(0, 'username')} 
						className="w-full" 
						type='username'
						placeholder='username'
						style={formState[0].isError ? { borderColor: 'var(--invalid-color)', color: 'var(--invalid-color)' } : {}}
						/>
					<Input
						onChange={(e) => {
							setPassword(e.target.value)
							parseInput('password', e.target.value);
						}}
						onBlur={() => blurHandler(2, 'password')} 
						className="w-full" 
						type='password'
						placeholder='password'
						style={formState[2].isError ? { borderColor: 'var(--invalid-color)', color: 'var(--invalid-color)' } : {}}
						/>
					<Input
						onChange={(e) => {
							setRetypePassword(e.target.value)
							parseInput('retype_password', e.target.value, password);
						}}
						onBlur={() => blurHandler(3, 'retype_password')} 
						className="w-full" 
						type='password'
						placeholder='confirm password'
						style={formState[3].isError ? { borderColor: 'var(--invalid-color)', color: 'var(--invalid-color)' } : {}}
						/>
				</>
				{formError != '' && <p className="text-sm self-end text-invalid">{formError}</p>}
				</div>
				<Button 
					type="submit"
					disabled={state.isLoading}
					>
						complete Sign up
				</Button>
			</form>
			<Loading />
		</>
	)
}

export default RemainForm;