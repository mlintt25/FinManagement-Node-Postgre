import { Router } from 'express'
import { loginController } from '~/controllers/auth.controller'
import { loginValidator } from '~/middlewares/auth.middleware'
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

export default authRouter
