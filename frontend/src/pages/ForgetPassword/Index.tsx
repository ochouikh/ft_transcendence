import Welcome from "../Sign-up/Welcome";
import { useEffect, useRef, useState } from "react";
import Loading from "@/components/Loading";
import { useSearchParams } from "react-router-dom";
import EnterEmail from "./EnterEmail";
import UpdatePassword from "./UpdatePassword";
import EmailSent from "./EmailSent";

const Index = () => {
	const [ step, setStep ] = useState<'initial' | 'email-sent' | 'update-password'>('initial');
	const [ searchParams ] = useSearchParams();
	const acessToken = useRef('');
	const email = useRef<string>('');

	
	useEffect(() => {
		const token = searchParams.get('token');
		if (token) {
			acessToken.current = token;
			setStep('update-password')
		}
	}, [])

	return (
		<>
			<div className="bg-bg min-h-[100vh] flex">
				<Welcome />
				<div className="flex justify-center items-center p-5 sm:p-20 w-full">
					<div className={"w-full flex flex-col gap-9 items-center " + (step != 'email-sent' ? 'max-w-[350px]': 'max-w-[400px]')}>
						<div className="relative w-full flex flex-col items-center place-content-center">
						<div className="w-full">
							{step == 'initial' && <EnterEmail setStep={setStep} email={email} /> }
							{step == 'email-sent' && <EmailSent email={email.current} /> }
							{step == 'update-password' && <UpdatePassword token={acessToken.current} /> }
						</div>
						</div>
					</div>
				</div>
			</div>
			<Loading />
		</>
	);
}

export default Index;