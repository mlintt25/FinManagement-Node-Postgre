import { Request } from 'express'
import { UserType } from './schemaValidations/users.schema'
import { TokenPayload } from './types/jwt.type'

declare module 'express-serve-static-core' {
  interface Request {
    decodedAccessToken?: TokenPayload
    decodedRefreshToken?: TokenPayload
    decodedEmailVerifyToken?: TokenPayload
    decodeOAuthToken?: OAuthTokenPayload
    user?: UserType
  }
}
