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
    // 1) убеждаемся, что это 401 и мы ещё не ре-трайили
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 2) вытаскиваем refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        // нет куда рефрешить — сразу логаут
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // 3) шлём на /auth/refresh DTO { refreshToken: string }
        const { data } = await authApi.post('/auth/refresh', { refreshToken })

        const { access_token, refresh_token } = data

        // 4) сохраняем оба токена
        localStorage.setItem('jwtToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)

        // 5) на всякий случай обновляем defaults
        backendApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        // 6) и обновляем сам запрос
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`
        return backendApi(originalRequest)
      } catch (refreshError) {
        // и если рефреш не прошёл — чистим и кидаем на логин
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // все остальные ошибки
    return Promise.reject(error)
  }
)


export { authApi, backendApi }
