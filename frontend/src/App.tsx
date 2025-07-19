import { useEffect, useState } from 'react'
import './App.css'
import { authApi, backendApi } from './api/axiosInstance'

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || null)
  const [response, setResponse] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('jwtToken')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const Login = async () => {
    try {
      const res = await authApi.post('/auth/login', {
        username: 'username',
        password: '1234',
      })

      const jwt = res.data.access_token
      const refresh = res.data.refresh_token

      setToken(jwt)
      localStorage.setItem('jwtToken', jwt)
      localStorage.setItem('refreshToken', refresh)

      setResponse('Успешный вход. Токены сохранены.')
    } catch (err) {
      console.error(err)
      setResponse('Ошибка при входе.')
    }
  }

  const GetWithAuth = async () => {
    try {
      const res = await backendApi.get('/auth/with')
      setResponse(`Ответ (с авторизацией): ${JSON.stringify(res.data)}`)
    } catch (err) {
      console.error(err)
      setResponse('Ошибка при авторизованном запросе.')
    }
  }

  const GetWithoutAuth = async () => {
    try {
      const res = await backendApi.get('/auth/without')
      setResponse(`Ответ (без авторизации): ${JSON.stringify(res.data)}`)
    } catch (err) {
      console.error(err)
      setResponse('Ошибка при неавторизованном запросе.')
    }
  }

  const Logout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setResponse('Вы вышли из системы.')
  }

  return (
    <>
      <div>
        <button onClick={Login}>Войти</button>
        <button onClick={GetWithoutAuth}>Без авторизации</button>
        <button onClick={GetWithAuth}>С авторизацией</button>
        <button onClick={Logout} disabled={!token}>Выйти</button>
        <p>{response}</p>
      </div>
    </>
  )
}

export default App
