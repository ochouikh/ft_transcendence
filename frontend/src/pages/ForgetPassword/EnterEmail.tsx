import { ChangeEvent, Dispatch, FormEvent, MutableRefObject, SetStateAction, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import axios from "axios";
import { validate } from "@/utils/validation";
import Loading from "@/components/Loading";
import { Link } from "react-router-dom";
import { API_END_POINT } from "@/utils/urls";

interface Props {
	email: MutableRefObject<string>
	setStep: Dispatch<SetStateAction<"initial" | "email-sent" | "update-password">>
}

function EnterEmail({ email, setStep }: Props) {
	const { state, dispatch } = useGlobalContext();
	const [error, setError] = useState({
		state: false,
		content: ''
	})

	const submitHandler = async (e: FormEvent) => {
		try {
			e.preventDefault();
			dispatch({type: STORE_OPTS.LOADING, state: true})
			if (!validate('email', email.current)) {
				throw {
					invalid: true,
					content: 'Invalid Email'
				}
			}
			await axios.post(API_END_POINT + 'forget-password/', {
				email: email.current,
				refer: ''
			})
			setStep('email-sent');
			setError({
				state: false,
				content: ''
			})
		} catch (error: any & {message: string}) {
			setError({
				state: true,
				content: error?.response?.data.error.type == "email_not_found" 
				? 'This Email has not assigned to any user'
				: error.invalid ? error.content
				: 'an error while sending the email'
			})
		}
		dispatch({type: STORE_OPTS.LOADING, state: false})
    }

	const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
		email.current = e.target.value;
		setError({
			state: false,
			content: ''
		})
	}

	return ( 
		<>
			<h1 className="text-2xl text-center font-semibold mb-14 italic">Forget Password</h1>
			<form onSubmit={submitHandler} className="flex flex-col justify-between w-full h-[160px]">
				<div className="flex flex-col gap-5 w-full">
					<Input
						onChange={onChangeHandler}
						className="w-full"
						type='email'
						placeholder='Enter your email'
						style={ error.state ? { borderColor:  'var(--invalid-color)', color: 'var(--invalid-color)'} : {}}
					/>
					{error.state && <p className="text-sm self-end text-invalid">{error.content}</p>}
				</div>
				<Button 
					type="submit"
					disabled={state.isLoading}
					onClick={submitHandler}
					className="mt-5"
					>
						Submit
				</Button>
			</form>
			<Link to='/login' className="text-center">
				<p className="text-sm text-gray1 hover:underline cursor-pointer mt-10">back to login</p>
			</Link>
			<Loading />
		</>
	 );
}

export default EnterEmail;