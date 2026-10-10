import type { Credentials } from './credentials'
import type {
  SendMessageRequest,
  SendMessageResponse,
  IncomingNotification,
  CheckAccountResponse,
  CheckAccountError,
  CheckAccountRequest,
} from './types'
import { validateSendMessage, validateCheckAccount } from './validate'
import { RECEIVE_TIMEOUT_MIN, RECEIVE_TIMEOUT_MAX, RECEIVE_TIMEOUT_DEFAULT } from './constants'

const BASE = import.meta.env.VITE_API_URL

export const CHECK_ACCOUNT_METHOD = 'checkAccount'

export class GreenApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'GreenApiError'
    this.code = code
  }
}

export function isCheckAccountError(res: CheckAccountResponse): res is CheckAccountError {
  return 'status' in res && res.status === false
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new GreenApiError(res.status, `HTTP ${res.status}`)
  }

  if (!res.ok) {
    const err = data as { message?: string; code?: number }
    throw new GreenApiError(err.code ?? res.status, err.message ?? `Ошибка ${res.status}`)
  }

  return data as T
}

export function makeApi({ idInstance, apiTokenInstance }: Credentials) {
  const url = (method: string) => `${BASE}/waInstance${idInstance}/${method}/${apiTokenInstance}`

  const deleteUrl = (receiptId: number) =>
    `${BASE}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`

  return {
    getStateInstance: () => request<{ stateInstance: string }>(url('getStateInstance')),

    sendMessage: (input: SendMessageRequest) => {
      const errors = validateSendMessage(input)
      if (errors.length) {
        throw new GreenApiError(400, errors.join('; '))
      }

      return request<SendMessageResponse>(url('sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },

    receiveNotification: (receiveTimeout: number = RECEIVE_TIMEOUT_DEFAULT) => {
      if (
        !Number.isInteger(receiveTimeout) ||
        receiveTimeout < RECEIVE_TIMEOUT_MIN ||
        receiveTimeout > RECEIVE_TIMEOUT_MAX
      ) {
        throw new GreenApiError(
          400,
          `receiveTimeout должен быть от ${RECEIVE_TIMEOUT_MIN} до ${RECEIVE_TIMEOUT_MAX}`
        )
      }
      return request<{ receiptId: number; body: IncomingNotification } | null>(
        `${url('receiveNotification')}?receiveTimeout=${receiveTimeout}`
      )
    },

    deleteNotification: (receiptId: number) =>
      request<{ result: boolean; reason: string }>(deleteUrl(receiptId), {
        method: 'DELETE',
      }),
    checkAccount: (input: CheckAccountRequest) => {
      const errors = validateCheckAccount(input)
      if (errors.length) {
        throw new GreenApiError(400, errors.join('; '))
      }

      return request<CheckAccountResponse>(url(CHECK_ACCOUNT_METHOD), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    },
  }
}

export type GreenApi = ReturnType<typeof makeApi>
