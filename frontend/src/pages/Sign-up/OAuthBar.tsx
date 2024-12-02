import { useRef } from "react";
import OAuth from "@/components/OAuth";
import { API_END_POINT } from "@/utils/urls";
import { STORE_OPTS, useGlobalContext } from "@/contexts/store";

const OAuthBar = () => {
	const OAuthLink = useRef<string>('');
	const { dispatch } = useGlobalContext();

	const generateLink = async (type: 'google' | '42') => {
		try {
			const endpoint = type == 'google' ? 'generate-googlelink/' : 'generate-42link/';
			const response = await fetch(API_END_POINT + endpoint, {
				method: 'Get'
			})

			const body = await response.json();
	
			if (!response.ok) throw new Error('response error');
			OAuthLink.current = body.link;
			location.href = OAuthLink.current
		} catch (error) {
			dispatch({type: STORE_OPTS.ALERT, message: 'An Error Occured, try after a while', isError: true, dispatch})
		}
	}

	return (
		<div className="w-full flex justify-between gap-2">
			<OAuth onClick={() => generateLink('42')} type="42"/>
			<OAuth onClick={() => generateLink('google')} type="google"/>
		</div>
	)
}

export default OAuthBar;