import { Router } from 'express'
import { loginController, registerController } from '~/controllers/auth.controller'
import { loginValidator, registerValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const authRouter = Router()

/**
 * @description Logs the user into their account.
 * @path /login
 * @method POST
 * @body { email: string, password: string }
 * @returns {Object} Response object with message and data.
 */
authRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * @description Register a new account.
 * @path /register
 * @method POST
 * @body { email: string, password: string, confirmPassword: string }
 * @returns {Object} Response object with message.
 */
authRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default authRouter
