import { useState, type SyntheticEvent } from 'react'
import { isValidPhoneNumber } from '../api/validate'
import type { GreenApi } from '../api/api'
import { GreenApiError, isCheckAccountError } from '../api/api'
import type { Chat } from '../api/chats'
import { chatsStore } from '../api/chats'
import { ID_ATTRIBUTE } from '../api/constants'
import styles from './Sidebar.module.css'

type Props = {
  api: GreenApi
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
}

export function Sidebar({ api, activeChatId, onSelectChat }: Props) {
  const [chats, setChats] = useState<Chat[]>(() => chatsStore.load())
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateChat(e: SyntheticEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const phoneNumber = Number(phone.replace(/\D/g, ''))
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        setError(
          'Номер должен быть в формате 7XXXXXXXXXX (РФ, 11 цифр) или 375XXXXXXXXX (РБ, 12 цифр)'
        )
        return
      }

      const res = await api.checkAccount({ phoneNumber })

      if (isCheckAccountError(res)) {
        setError(res.reason)
        return
      }

      const chatId = res.exist ? res.chatId : ''
      if (!chatId) {
        setError('Сервис не вернул chatId — аккаунт не найден?')
        return
      }

      // уже есть такой чат?
      const existing = chats.find((c) => c.chatId === chatId)
      if (existing) {
        onSelectChat(existing.chatId)
        setPhone('')
        return
      }

      const chat: Chat = { chatId, phone: phoneNumber }
      const next = [...chats, chat]
      setChats(next)
      chatsStore.save(next)
      onSelectChat(chat.chatId)
      setPhone('')
    } catch (err) {
      if (err instanceof GreenApiError) {
        setError(`[${err.code}] ${err.message}`)
      } else {
        setError('Не удалось проверить номер')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.sidebar}>
      <form className={styles.newChat} onSubmit={handleCreateChat} id={ID_ATTRIBUTE}>
        <input
          id={`${ID_ATTRIBUTE}-phone`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="79991234567"
          inputMode="tel"
        />
        <button id={`${ID_ATTRIBUTE}-add-chat`} disabled={loading || !phone.trim()}>
          {loading ? '…' : '+'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.list}>
        {chats.length === 0 && <li className={styles.empty}>Нет чатов. Добавьте первый.</li>}
        {chats.map((chat) => (
          <li
            key={chat.chatId}
            className={
              chat.chatId === activeChatId ? `${styles.item} ${styles.itemActive}` : styles.item
            }
            onClick={() => onSelectChat(chat.chatId)}
          >
            <div className={styles.itemName}>{chat.phone}</div>
            <div className={styles.itemId}>{chat.chatId}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
