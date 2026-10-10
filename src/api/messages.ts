export type Message = {
  id: string
  from: 'me' | 'them'
  text: string
  timestamp: number
}

const KEY = 'greenapi.messages'
const HISTORY_LIMIT = 500

type MessagesByChat = Record<string, Message[]>

function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false

  const m = value as Message
  return (
    typeof m.id === 'string' &&
    (m.from === 'me' || m.from === 'them') &&
    typeof m.text === 'string' &&
    typeof m.timestamp === 'number'
  )
}

function loadAll(): MessagesByChat {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

    const result: MessagesByChat = {}
    for (const [chatId, list] of Object.entries(parsed as MessagesByChat)) {
      if (Array.isArray(list)) {
        result[chatId] = list.filter(isMessage)
      }
    }
    return result
  } catch {
    return {}
  }
}

function persist(all: MessagesByChat) {
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export const messagesStore = {
  get(chatId: string): Message[] {
    return loadAll()[chatId] ?? []
  },

  append(chatId: string, m: Message) {
    const all = loadAll()
    const list = all[chatId] ?? []

    if (list.some((item) => item.id === m.id)) return

    all[chatId] = [...list, m].slice(-HISTORY_LIMIT)
    persist(all)
  },
}
