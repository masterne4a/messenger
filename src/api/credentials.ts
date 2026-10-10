const KEY = 'greenapi.credentials.session'

export type Credentials = {
  idInstance: string
  apiTokenInstance: string
}

export const credentials = {
  load(): Credentials | null {
    try {
      const raw = sessionStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  save(c: Credentials) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(c))
    } catch {
      // приватный режим или переполнение — вход просто не сохранится
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      // нечего чистить
    }
  },
}
