import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { GreenApi } from '../api/api'
import { GreenApiError } from '../api/api'
import type { IncomingNotification } from '../api/types'
import { isTextMessageData } from '../api/types'
import { useNotificationPolling } from '../hooks/useNotificationPolling'
import { messagesStore, nowSeconds } from '../api/messages'
import { MESSAGE_MAX_LENGTH, ID_ATTRIBUTE } from '../api/constants'
import styles from './ChatView.module.css'

type Props = {
  api: GreenApi
  activeChatId: string | null
  tick: number
  onTick: () => void
  onLogout: () => void
}

export function ChatView({ api, activeChatId, tick, onTick, onLogout }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const handleNotification = useCallback(
    (n: IncomingNotification) => {
      if (n.typeWebhook !== 'incomingMessageReceived') return
      const chatId = n.senderData.chatId
      const { messageData } = n
      // принимаем только текстовые сообщения
      if (!chatId || !messageData || !isTextMessageData(messageData)) return

      messagesStore.append(chatId, {
        id: n.idMessage,
        from: 'them',
        text: messageData.textMessageData.textMessage,
        timestamp: n.timestamp,
      })
      onTick()
    },
    [onTick]
  )

  useNotificationPolling({ api, onNotification: handleNotification, receiveTimeout: 10 })

  const chatId = activeChatId ?? ''
  const messages = chatId ? messagesStore.get(chatId) : []
  const [sending, setSending] = useState(false)

  // автопрокрутка вниз при новом сообщении
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, chatId, tick])
  async function sendMessage() {
    // убираем BOM и лишние пробелы; лимит 4000 символов, включая emoji
    const message = text.replace(/\uFEFF/g, '').trim()
    if (!message || !chatId || sending) return

    setError(null)
    setSending(true)

    try {
      const res = await api.sendMessage({ chatId, message })
      messagesStore.append(chatId, {
        id: res.idMessage,
        from: 'me',
        text: message,
        timestamp: nowSeconds(),
      })
      setText('')
      onTick()
    } catch (err) {
      if (err instanceof GreenApiError) {
        setError(`[${err.code}] ${err.message}`)
      } else {
        setError('Не удалось отправить')
      }
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void sendMessage()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>{chatId || 'GreenAPI'}</div>
        <button className={styles.logout} onClick={onLogout}>
          Выйти
        </button>
      </header>

      <div className={styles.messages} ref={listRef}>
        {!chatId && <div className={styles.emptyMessages}>Выберите чат или создайте новый</div>}
        {chatId && messages.length === 0 && (
          <div className={styles.emptyMessages}>Сообщений пока нет</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.from === 'me'
                ? `${styles.message} ${styles.messageMine}`
                : `${styles.message} ${styles.messageTheirs}`
            }
          >
            <div className={styles.messageText}>{m.text}</div>
            <div className={styles.messageTime}>
              {new Date(m.timestamp * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>

      <form className={styles.input} onSubmit={handleSubmit} id={ID_ATTRIBUTE}>
        <textarea
          id={`${ID_ATTRIBUTE}-message-text`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение…"
          maxLength={MESSAGE_MAX_LENGTH}
          rows={1}
          required
          disabled={!chatId}
          onKeyDown={handleKeyDown}
        />
        <button id={`${ID_ATTRIBUTE}-send`} disabled={!chatId || sending || !text.trim()}>
          {sending ? '…' : 'Отправить'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
