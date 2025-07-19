import axios from 'axios'

const authApi = axios.create({
  baseURL: 'http://localhost:8001',
  withCredentials: true
})

const backendApi = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true
})

backendApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwtToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

backendApi.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    // IF STATUSCODE == 401 REFRESH TOKEN
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        //LOGOUT IF NO REFRESH TOKEN
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await authApi.post('/auth/refresh', { refreshToken })

        const { access_token, refresh_token } = data

        // REFRESH LOCALSTORAGE
        localStorage.setItem('jwtToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)

        // UPDATE HEADERS
        backendApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        originalRequest.headers['Authorization'] = `Bearer ${access_token}`
        return backendApi(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        // window.location.href = '/login'    FUTURED
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)


export { authApi, backendApi }
