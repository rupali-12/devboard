// client/src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// NO redirect here — let the router guard handle navigation.
// Just reject the error so the calling code can handle it.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default api