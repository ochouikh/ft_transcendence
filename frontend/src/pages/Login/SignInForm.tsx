import Input from "@/components/Input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useState } from "react";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import callToApi from "@/api/callToApi";
import Button from "@/components/Button";
import { AUTH_OPTS, useAuthContext } from "@/contexts/authProvider";
import Loading from "@/components/Loading";

interface IResponse {
	type: string,
	data : {
		identity: {
			type: string,
			value: string
		},
		password: string
	},
	refer: string
}

interface Props {
	setIsTwoFA: Dispatch<SetStateAction<boolean>>
}

const SignInForm = ({ setIsTwoFA }: Props) => {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [isValidUsername, setIsValidUsername] = useState<boolean>(true);
	const [isValidPassword, setIsValidPassword] = useState<boolean>(true);
	const [invalidLogin, setInvalidLogin] = useState<boolean>(false);
	const [emptyInput, setEmptyInput] = useState<boolean>(false);
	const { state, dispatch } = useGlobalContext();
	const { dispatch: authDispatch } = useAuthContext();
	const navigate = useNavigate();
	const location = useLocation();

	const usernameHandler = (userValue: string) => {
		setEmptyInput(false);
		setInvalidLogin(false);
		setUsername(userValue);
		if (username != '') setIsValidUsername(true);
	}

	const passwordHandler = (passValue: string) => {
		setEmptyInput(false);
		setInvalidLogin(false);
		setPassword(passValue);
		if (password != '') setIsValidPassword(true);
	}

	const blurUserHandler = () => {
		if (username === '') setIsValidUsername(false);
	}
	
	const blurPassHandler = () => {
		if (password === '') setIsValidPassword(false);
	}

	const submitHandler = async (e: any) => {
		e.preventDefault();
		dispatch({type: STORE_OPTS.LOADING, state: true});

		const data: IResponse = {
			type: "normal",
			data : {
				identity: {
					type: "username",
					value: username
				},
				password: password
			},
			refer: ""
		}
		
		try {
				if (username == '' || password == '')
				{
					setEmptyInput(true);
					throw ("empty input");
				}
				setEmptyInput(false);
				
				const res = await callToApi('login/', data);
				if ('TFA' in res) {
					localStorage.setItem('tfa', res.TFA.token);
					setIsTwoFA(true);
				} else {
					authDispatch({type: AUTH_OPTS.TOKEN, token: res.access_token})
					setInvalidLogin(false);
					navigate(location.state?.refer || '/dashboard', { 
						replace: true, 
						state: {
							message: 'You have logged in successfully'
					} });
				}
		}
		catch (error: any) {
			setIsValidUsername(true);
			setIsValidPassword(true);
			setInvalidLogin(true);
		}
		dispatch({type: STORE_OPTS.LOADING, state: false});
	}

    return (
        <>
            <h1 className="font-semibold text-2xl italic mb-14">Welcome Back!</h1>
            <form onSubmit={(e) => submitHandler(e)} className="flex flex-col justify-between w-full h-[265px]">
				<div className="flex flex-col gap-5 w-full">
					<Input
						onChange={(e) => usernameHandler(e.target.value)}
						onBlur={() => blurUserHandler()}
						className={"w-full"} 
						style={(!isValidUsername || emptyInput || invalidLogin) ? {borderColor: 'var(--invalid-color)', color: 'var(--invalid-color)'} : {}}
						type="username" 
						placeholder="username"
					/>
					<Input 
						onChange={(e) => passwordHandler(e.target.value)} 
						onBlur={() => blurPassHandler()}
						className={"w-full"}  
						style={(!isValidPassword || emptyInput || invalidLogin) ? {borderColor: 'var(--invalid-color)', color: 'var(--invalid-color)'} : {}}
						type="password" 
						placeholder="password"
					/>
					<Link to='/forget-password' className="self-end">
						<p className="text-sm text-gray1 hover:underline cursor-pointer">forget password?</p>
					</Link>
					{(!isValidUsername && !invalidLogin && !emptyInput) ? <p className="text-sm self-end text-invalid">Invalid username</p> : ''}
					{(!isValidPassword && isValidUsername && !invalidLogin && !emptyInput) ? <p className="text-sm self-end text-invalid">Password field should not be blank</p> : ''}
					{(emptyInput && !invalidLogin) ? <p className="text-sm self-end text-invalid">Please fill the Sign In form</p> : ''}
					{(invalidLogin) ? <p className="text-sm self-end text-invalid">invalid Username or Password</p> : ''}
				</div>
				<Button
					onClick={(e) => submitHandler(e)}
					disabled={state.isLoading}
					type="submit">Sign In
				</Button>
				<Loading />
			</form>
		</>
    );
}

export default SignInForm;