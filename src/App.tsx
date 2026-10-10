import { useEffect, useState } from 'react'
import styles from './App.module.css'
import type { GreenApi } from './api/api'
import { credentials } from './api/credentials'
import type { Credentials } from './api/credentials'
import { makeApi } from './api/api'
import { Messenger } from './components/Messenger'
import { LoginForm } from './components/LoginForm'

function App() {
  const [api, setApi] = useState<GreenApi | null>(() => {
    const saved = credentials.load()
    return saved ? makeApi(saved) : null
  })
  const [checking, setChecking] = useState(() => Boolean(credentials.load()))

  // сохранённые креды проверяем перед показом мессенджера
  useEffect(() => {
    const saved = credentials.load()
    if (!saved) return

    let cancelled = false

    makeApi(saved)
      .getStateInstance()
      .then(() => {
        if (!cancelled) setApi(makeApi(saved))
      })
      .catch(() => {
        if (cancelled) return
        credentials.clear()
        setApi(null)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleLogin(creds: Credentials) {
    credentials.save(creds)
    setApi(makeApi(creds))
  }

  function handleLogout() {
    credentials.clear()
    setApi(null)
  }

  return (
    <div className={styles.app}>
      {checking ? (
        <div className={styles.loading}>Проверка сохранённых данных…</div>
      ) : api ? (
        <Messenger api={api} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
