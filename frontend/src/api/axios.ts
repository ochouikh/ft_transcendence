import axios, { AxiosInstance } from "axios";
import { API_END_POINT } from "@/utils/urls";

const api: AxiosInstance = axios.create({
	baseURL: API_END_POINT,
	withCredentials: true,
})

export default api;