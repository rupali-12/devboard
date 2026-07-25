// client/src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('jwt='))
    ?.split('=')[1]

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`
  }

  return config
})

// NO redirect here — let the router guard handle navigation.
// Just reject the error so the calling code can handle it.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default api