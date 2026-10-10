export type Chat = { chatId: string; phone: number }

export type Message = {
  id: string
  from: 'me' | 'them'
  text: string
  timestamp: number
}

export type MessagesByChat = Record<string, Message[]>

export type SendMessageRequest = {
  chatId: string
  message: string
}

export type SendMessageResponse = {
  idMessage: string
}

export type IncomingNotification = {
  typeWebhook: string
  instanceData: {
    idInstance: number
    wid: string
    typeInstance: string
  }
  timestamp: number
  idMessage: string
  senderData: {
    chatId: string
    chatName: string
    chatType: 'user' | 'group'
    sender: string
    senderName: string
    senderType?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData: MessageData
}

export type TextMessageData = {
  typeMessage: 'textMessage'
  textMessageData: {
    textMessage: string
  }
}

export type OtherMessageData = {
  typeMessage: string
  [key: string]: unknown
}

export type MessageData = TextMessageData | OtherMessageData

export function isTextMessageData(data: MessageData): data is TextMessageData {
  return (
    data.typeMessage === 'textMessage' &&
    typeof (data as Partial<TextMessageData>).textMessageData?.textMessage === 'string'
  )
}

export type CheckAccountRequest = {
  phoneNumber: number
  force?: boolean
}

export type CheckAccountOk = {
  status?: undefined
  exist: boolean
  chatId: string
  fromCache: boolean
}

export type CheckAccountError = {
  status: false
  reason: string
}

export type CheckAccountResponse = CheckAccountOk | CheckAccountError
