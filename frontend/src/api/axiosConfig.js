import axios from 'axios'

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const api = axios.create({
    baseURL: `${backendBaseUrl}/api`,
    withCredentials: true

})
export default api