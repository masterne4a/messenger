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
  const [tick, setTick] = useState(0) // для обновления активного чата при новых сообщениях

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Sidebar api={api} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      </aside>

      <main className={styles.chat}>
        <ChatView
          api={api}
          activeChatId={activeChatId}
          tick={tick}
          onTick={() => setTick((t) => t + 1)}
          onLogout={onLogout}
        />
      </main>
    </div>
  )
}
