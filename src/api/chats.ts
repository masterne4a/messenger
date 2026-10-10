export type Chat = { chatId: string; phone: number }

const KEY = 'greenapi.chats'

export const chatsStore = {
  load(): Chat[] {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return []

      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []

      return parsed.filter(
        (chat): chat is Chat =>
          typeof chat === 'object' &&
          chat !== null &&
          typeof (chat as Chat).chatId === 'string' &&
          (chat as Chat).chatId.trim() !== '' &&
          typeof (chat as Chat).phone === 'number'
      )
    } catch {
      return []
    }
  },

  save(chats: Chat[]) {
    localStorage.setItem(KEY, JSON.stringify(chats))
  },
}
