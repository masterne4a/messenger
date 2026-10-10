import { useState, type SyntheticEvent } from 'react'
import { makeApi, GreenApiError } from '../api/api'
import { ID_ATTRIBUTE } from '../api/constants'
import styles from './LoginForm.module.css'

type Props = {
  onLogin: (creds: { idInstance: string; apiTokenInstance: string }) => void
}

export function LoginForm({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const creds = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }

    try {
      // проверяем креды перед входом
      const api = makeApi(creds)
      await api.getStateInstance()
      onLogin(creds)
    } catch (err) {
      if (err instanceof GreenApiError) {
        setError(`[${err.code}] ${err.message}`)
      } else {
        setError('Не удалось подключиться. Проверьте данные.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} id={ID_ATTRIBUTE}>
      <h1 className={styles.title}>Вход в GreenAPI</h1>

      <label className={styles.field}>
        <span>idInstance</span>
        <input
          id={`${ID_ATTRIBUTE}-instance`}
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          placeholder="3100000000"
          required
          autoFocus
        />
      </label>

      <label className={styles.field}>
        <span>apiTokenInstance</span>
        <input
          id={`${ID_ATTRIBUTE}-token`}
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          placeholder="••••••••••••"
          required
        />
      </label>

      <button
        id={`${ID_ATTRIBUTE}-login`}
        className={styles.button}
        disabled={loading || !idInstance.trim() || !apiTokenInstance.trim()}
      >
        {loading ? 'Проверка…' : 'Войти'}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  )
}
