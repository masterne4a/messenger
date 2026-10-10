import { useEffect, useRef } from 'react'
import type { GreenApi } from '../api/api'
import type { IncomingNotification } from '../api/types'

type Options = {
  api: GreenApi
  onNotification: (n: IncomingNotification) => void
  receiveTimeout?: number
}

export function useNotificationPolling({ api, onNotification, receiveTimeout = 5 }: Options) {
  const stoppedRef = useRef(false)

  useEffect(() => {
    stoppedRef.current = false

    async function loop() {
      while (!stoppedRef.current) {
        try {
          const res = await api.receiveNotification(receiveTimeout)

          if (!res) continue // пусто — сразу следующий запрос

          onNotification(res.body)

          // подтверждаем обработку — иначе уведомление вернётся снова
          await api.deleteNotification(res.receiptId)
        } catch {
          if (stoppedRef.current) break
          // не роняем цикл на сетевой ошибке, ждём и пробуем снова
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
    }

    loop()

    return () => {
      stoppedRef.current = true
    }
  }, [api, onNotification, receiveTimeout])
}
