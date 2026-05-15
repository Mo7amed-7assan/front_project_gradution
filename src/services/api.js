import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE = 'https://cofound.dpdns.org/api/v1'

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false
})

// Request interceptor to attach token
api.interceptors.request.use((config) =>
{
    const token = Cookies.get('cf_token')
    if (token)
    {
        config.headers = config.headers || {}
        config.headers['Authorization'] = `Bearer ${token}`
    }
    if (config.method && ['post', 'put', 'patch'].includes(config.method) && !(config.data instanceof FormData))
    {
        config.headers = config.headers || {}
        config.headers['Content-Type'] = 'application/json'
    }
    return config
}, (error) => Promise.reject(error))

// Response interceptor for 401 handling
api.interceptors.response.use((res) => res, (error) =>
{
    if (error?.response?.status === 401)
    {
        Cookies.remove('cf_token')
        try
        {
            window.location.href = '/login'
        } catch (e)
        {
            // ignore if not in browser
        }
    }
    return Promise.reject(error)
})

export default api
