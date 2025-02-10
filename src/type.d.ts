import { Request } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
