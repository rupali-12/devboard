// client/src/api/axios.ts
import axios from 'axios'

function setStoredToken(token: string | undefined | null) {
  if (typeof window === 'undefined' || !token) return

  const cleanedToken = decodeURIComponent(token)
  window.localStorage.setItem('devboard_token', cleanedToken)
  window.sessionStorage.setItem('devboard_token', cleanedToken)
}

function getStoredToken() {
  if (typeof window === 'undefined') return null

  return window.localStorage.getItem('devboard_token') || window.sessionStorage.getItem('devboard_token')
}

function getCookieToken() {
  if (typeof document === 'undefined') return null

  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('jwt='))
    ?.split('=')[1] || null
}

function syncTokenFromCookie() {
  const cookieToken = getCookieToken()
  if (cookieToken) {
    setStoredToken(cookieToken)
    return cookieToken
  }
  return null
}

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const storedToken = getStoredToken()
  const cookieToken = getCookieToken()
  const resolvedToken = storedToken || cookieToken || syncTokenFromCookie()

  if (resolvedToken && config.headers) {
    config.headers.Authorization = `Bearer ${decodeURIComponent(resolvedToken)}`
  }

  return config
})

// NO redirect here — let the router guard handle navigation.
// Just reject the error so the calling code can handle it.
api.interceptors.response.use(
  (response) => {
    const token = response?.data?.token
    if (token) {
      setStoredToken(token)
    } else {
      syncTokenFromCookie()
    }
    return response
  },
  (error) => Promise.reject(error)
)

export default api