import { Link, useLocation } from "react-router-dom";
import OAuthBar from "../Sign-up/OAuthBar";
import Welcome from "../Sign-up/Welcome";
import SignInForm from "./SignInForm";
import SignIn2FA from "./SingIn2FA";
import { useLayoutEffect, useState } from "react";

const Index = () => {
	const [isTwoFA, setIsTwoFA] = useState(false);
	const location = useLocation();

	useLayoutEffect(() => {
		location.state?.isTwoFA && setIsTwoFA(true);
	}, [])

	return (
		<div className="bg-bg min-h-[100vh] flex">
			<Welcome />
			<div className="flex justify-center items-center p-5 sm:p-20 w-full">
				<div className="w-full flex flex-col gap-9 items-center max-w-[350px]">
					<div className="relative w-full flex flex-col items-center place-content-center">
						{!isTwoFA  && <SignInForm setIsTwoFA={setIsTwoFA} />}
						{isTwoFA && <SignIn2FA setIsTwoFA={setIsTwoFA} />}
					</div>
					{!isTwoFA &&
					<>
					<p>or</p>
					<OAuthBar />
					<div className="flex items-center gap-2 text-sm">
						<p className="text-gray1">Don't have an account?</p>
						<Link to='/signup'>Sign up</Link>
					</div>
					</>}
				</div>
			</div>
		</div>
	);
}

export default Index;