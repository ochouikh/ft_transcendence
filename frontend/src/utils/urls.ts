const { VITE_APP_API_END_POINT, VITE_APP_WS_END_POINT } = import.meta.env;
export const API_END_POINT = VITE_APP_API_END_POINT
export const WS_END_POINT = VITE_APP_WS_END_POINT

class Urls {
	constructor() {}

	Api(uri: string) {
		return API_END_POINT + uri + "/";
	}

	Ws(uri: string) {
		return WS_END_POINT + uri + "/";
	}
}

const urls = new Urls();

export default urls;