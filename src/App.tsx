import { useEffect, useState } from 'react'
import styles from './App.module.css'
import type { GreenApi } from './api/api'
import { credentialsStore } from './api/store'
import type { Credentials } from './api/store'
import { makeApi } from './api/api'
import { Messenger } from './components/Messenger'
import { LoginForm } from './components/LoginForm'

function App() {
  const [api, setApi] = useState<GreenApi | null>(() => {
    const saved = credentialsStore.load()
    return saved ? makeApi(saved) : null
  })
  const [checking, setChecking] = useState(() => Boolean(credentialsStore.load()))

  // сохранённые креды проверяем перед показом мессенджера
  useEffect(() => {
    const saved = credentialsStore.load()
    if (!saved) return

    let cancelled = false

    makeApi(saved)
      .getStateInstance()
      .then(() => {
        if (!cancelled) setApi(makeApi(saved))
      })
      .catch(() => {
        if (cancelled) return
        credentialsStore.clear()
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
    credentialsStore.save(creds)
    setApi(makeApi(creds))
  }

  function handleLogout() {
    credentialsStore.clear()
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
