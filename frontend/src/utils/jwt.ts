import { jwtDecode } from 'jwt-decode'
import axios from 'axios';
import { API_END_POINT } from './urls';

class Jwt {

	constructor() {}

	isValid(token: string | null) {
		if (!token) return false;
		const payload = jwtDecode(token);
		const currentTime = Date.now() / 1000;

		if (!payload.exp || currentTime > payload.exp) {
			return false;
		}
		return true;
	}

	async refresh() {
		try {
			const res = await axios.post(API_END_POINT + 'token/refresh/', null, {
				withCredentials: true
			});
			return res.data.access_token
		} catch (error) {
			return null;
		}
	}
}

const jwt = new Jwt();

export default jwt;