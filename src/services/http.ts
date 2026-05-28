import axios from 'axios'

/**
 * Axios instance for the drill backend API.
 * Base URL comes from VITE_BACKEND_URL env variable.
 */
export const backendHttp = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 15000,
})

/**
 * Axios instance for the geo.admin.ch APIs (search, identify, etc.).
 */
export const geoAdminHttp = axios.create({
  baseURL: 'https://api3.geo.admin.ch',
  timeout: 10000,
})
