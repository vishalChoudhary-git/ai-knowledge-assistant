import {ERROR_MESSAGES,LIMITS} from "./constants"

export function validateMessage(message: string,): string{

  if(!message || typeof message !== 'string')
    throw new Error(ERROR_MESSAGES.INVALID_MESSAGE)
  const messageLength = message.trim().length
  if(messageLength === 0)
    throw new Error(ERROR_MESSAGES.EMPTY_MESSAGE)
  if (messageLength > LIMITS.MAX_MESSAGE_LENGTH) {
    throw new Error(ERROR_MESSAGES.MESSAGE_TOO_LONG)
  }
  return message;
}