import axios from 'axios'
import { useEffect, useState } from 'react'
import './App.css'

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
      const res = await axios.post('http://localhost:8001/auth/login', {
        username: 'username',
        password: '1234',
    })

      const jwt = res.data.token
      setToken(jwt)
      localStorage.setItem('jwtToken', jwt)
      setResponse('Успешный вход. Токен сохранён.')
    } catch (err) {
      console.error(err)
      setResponse('Ошибка при входе.')
    }
  }

  const GetWithAuth = async () => {
    if (!token) {
      setResponse('Токен не найден. Выполните вход.')
      return
    }

    try {
      const res = await axios.get('http://localhost:8000/auth/with', {
        headers: {
          Authorization: `Bearer ${token}`
        }, withCredentials : true 
      })
      setResponse(`Ответ (с авторизацией): ${JSON.stringify(res.data)}`)
    } catch (err) {
      console.error(err)
      setResponse('Ошибка при авторизованном запросе.')
    }
  }

  const GetWithoutAuth = async () => {
    try {
      const res = await axios.get('http://localhost:8000/auth/without')
      setResponse(`Ответ (без авторизации): ${JSON.stringify(res.data)}`)
    } catch (err) {
      console.error(err)
      setResponse('Ошибка при неавторизованном запросе.')
    }
  }

  const Logout = () => {
    localStorage.removeItem('jwtToken')
    setToken(null)
    setResponse('Вы вышли из системы.')
  }

  return (
    <>
      <div>
        <button onClick={Login}>Войти</button>
        <button onClick={GetWithoutAuth}>Получить без авторизации</button>
        <button onClick={GetWithAuth}>Получить с авторизацией</button>
        <button onClick={Logout} disabled={!token}>Выйти</button>
        <p>{response}</p>
      </div>
    </>
  )
}

export default App