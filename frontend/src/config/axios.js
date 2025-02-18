import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        Authorization: `bearer ${localStorage.getItem('token')}`
    }
})

export default axiosInstance;