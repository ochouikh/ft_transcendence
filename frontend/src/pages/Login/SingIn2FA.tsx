import Input from "@/components/Input";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import callToApi from "@/api/callToApi";
import { Dispatch, SetStateAction, useState } from "react";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";
import { AUTH_OPTS, useAuthContext } from "@/contexts/authProvider";
import Loading from "@/components/Loading";

interface Props {
    setIsTwoFA: Dispatch<SetStateAction<boolean>>
}

const SignIn2FA = ({setIsTwoFA}: Props) => {
    const [otpCode, setOtpCode] = useState('');
    const navigate = useNavigate();
    const { state, dispatch } = useGlobalContext();
    const { dispatch: authDispatch } = useAuthContext();
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        dispatch({type: STORE_OPTS.LOADING, state: true})
        const data = {
            otp: otpCode,
            token: localStorage.getItem('tfa') || '',
            refer: ''
        }

        if (otpCode.length != 6) {
            setError('2fa code should be 6 digits')
            dispatch({type: STORE_OPTS.LOADING, state: false})
            return;
        }

        try {
            const res = await callToApi('2fa/', data);
            setError('');
            authDispatch({type: AUTH_OPTS.TOKEN, token: res.access_token});
            navigate('/dashboard', { 
                replace: true, 
                state: {
                    message: 'You have logged in successfully'
            } });
        
        } catch (error) {
            setError('Invalid code')
        }
        dispatch({type: STORE_OPTS.LOADING, state: false})
    }

    const tryAgain = () => {
        navigate('/login')
        setIsTwoFA(false);
    }

    return (
        <>
            <div className="flex flex-col gap-[2rem] max-w-[400px]">
                <h1 className="font-semibold text-2xl leading-9 text-left italic">two-factor authentication</h1>
                <span className="font-normal text-sm">
                    enter the verification code that has been sent to your email
                </span>
                <div className="flex flex-col items-end gap-[1rem]">
                    <Input
                        onChange={(e) => setOtpCode(e.target.value)}
                        type="number" className="w-full" placeholder="verification code">
                    </Input>
                    {error != '' && <p className="text-invalid text-sm">{error}</p>}
                    {/* <Link to="/forget-password" className="font-normal text-xs text-gray1">resend?</Link> */}
                    <Button 
                        disabled={state.isLoading} 
                        onClick={handleSubmit} 
                        className="w-full my-9">Verify</Button>
                </div>
                <div className="text-sm flex justify-between">
                    <p className="text-gray1">didn't receive the code?</p>
                    <span 
                        onClick={tryAgain} 
                        className="cursor-pointer hover:underline duration-300">try again</span>
                </div>
            </div>
            <Loading />
        </>

    );
}

export default SignIn2FA;