import type { SendMessageRequest, CheckAccountRequest } from './types'
import { PHONE_RU_LENGTH, PHONE_RB_LENGTH } from './constants'

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidPhoneNumber(phoneNumber: number): boolean {
  const s = String(phoneNumber)
  if (!/^\d+$/.test(s)) return false

  const isRU = s.startsWith('7') && s.length === PHONE_RU_LENGTH
  const isRB = s.startsWith('375') && s.length === PHONE_RB_LENGTH

  return isRU || isRB
}

// минимальная проверка: нужны непустые chatId и message;
export function validateSendMessage(input: SendMessageRequest): string[] {
  const errors: string[] = []

  if (!input.chatId?.trim()) {
    errors.push('chatId обязателен')
  }

  if (!input.message?.length) {
    errors.push('message не может быть пустым')
  }

  return errors
}

export function validateCheckAccount(input: CheckAccountRequest): string[] {
  const errors: string[] = []
  const s = onlyDigits(String(input.phoneNumber))
  if (!s) {
    errors.push('phoneNumber должен содержать только цифры')
    return errors
  }

  if (!isValidPhoneNumber(Number(s))) {
    errors.push(
      'phoneNumber должен быть в формате 7XXXXXXXXXX (РФ, 11 цифр) ' +
        'или 375XXXXXXXXX (РБ, 12 цифр)'
    )
  }

  return errors
}
