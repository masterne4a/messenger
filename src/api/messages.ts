import type { Message, MessagesByChat } from './types'

export const HISTORY_LIMIT = 500

export function appendTo(all: MessagesByChat, chatId: string, m: Message): MessagesByChat {
  const list = all[chatId] ?? []

  if (list.some((item) => item.id === m.id)) return all

  return { ...all, [chatId]: [...list, m].slice(-HISTORY_LIMIT) }
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}
