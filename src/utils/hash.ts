import { createHash } from 'crypto'
import envConfig from '~/configs'

export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + envConfig.PASSWORD_SECRET)
}
