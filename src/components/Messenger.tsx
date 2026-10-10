import { useState } from 'react'
import type { GreenApi } from '../api/api'
import { Sidebar } from './Sidebar'
import { ChatView } from './ChatView'
import styles from './Messenger.module.css'

type Props = {
  api: GreenApi
  onLogout: () => void
}

export function Messenger({ api, onLogout }: Props) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Sidebar api={api} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      </aside>

      <main className={styles.chat}>
        <ChatView api={api} activeChatId={activeChatId} onLogout={onLogout} />
      </main>
    </div>
  )
}
