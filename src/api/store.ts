const KEY = 'greenapi.credentials'

export type Credentials = {
  idInstance: string
  apiTokenInstance: string
}

export const credentialsStore = {
  load(): Credentials | null {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  save(c: Credentials) {
    localStorage.setItem(KEY, JSON.stringify(c))
  },
  clear() {
    localStorage.removeItem(KEY)
  },
}
