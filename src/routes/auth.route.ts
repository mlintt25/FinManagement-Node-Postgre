import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/auth.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const authRouter = Router()

/**
 * @description Logs the user into their account.
 * @path /api/auth/login
 * @method POST
 * @body { email: string, password: string }
 * @returns {Object} Response object with message and data.
 */
authRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * @description Register a new account.
 * @path /api/auth/register
 * @method POST
 * @body { email: string, password: string, confirmPassword: string }
 * @returns {Object} Response object with message.
 */
authRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
/**
 * @description Logout the user from their account.
 * @path /api/auth/logout
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { refreshToken: string }
 * @returns {Object} Response object with message.
 */
authRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
/**
 * @description Refresh access token when token expire.
 * @path /api/auth/refresh-token
 * @method POST
 * @body { refreshToken: string }
 * @returns {Object} Response object with message and data.
 */
authRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

export default authRouter
