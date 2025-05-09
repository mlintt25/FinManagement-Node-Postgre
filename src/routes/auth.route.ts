import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  loginWithGoogleController,
  verifyEmailController,
  sendVerifyEmailController
} from '~/controllers/auth.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  unverifiedUserValidator,
  loginWithGoogleValidator
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
 * @description Login with Google OAuth.
 * @path /api/auth/google
 * @method GET
 * @body { idToken: string }
 * @returns {Object} Response object with message and data.
 */
authRouter.post('/google', loginWithGoogleValidator, wrapRequestHandler(loginWithGoogleController))
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
/**
 * @description Send verify email for user.
 * @path /api/auth/send-verify-email
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message.
 */
authRouter.get(
  '/send-verify-email',
  accessTokenValidator,
  unverifiedUserValidator,
  wrapRequestHandler(sendVerifyEmailController)
)
/**
 * @description Verify email when user client click on the link in email.
 * @path /api/auth/verify-email
 * @method POST
 * @body { email_verify_token: string }
 * @returns {Object} Response object with message.
 */
authRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

export default authRouter
