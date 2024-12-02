import { Link } from "react-router-dom";
import { CiCircleCheck } from "react-icons/ci";

function EmailSent({email}: {email: string}) {
	return ( 
		<>
			<div className="flex justify-center mb-5">
				<CiCircleCheck className="text-6xl fill-primary" />
			</div>
			<p className="text-center">We have just sent an email with a link to update password to <b>{email}</b></p>
			<Link to='/login' className="text-center">
				<p className="text-sm text-gray1 underline hover:no-underline cursor-pointer mt-5">back to login</p>
			</Link>
		</>
	 );
}

export default EmailSent;