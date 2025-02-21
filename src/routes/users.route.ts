import { Router } from 'express'
import { changePasswordController } from '~/controllers/users.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { changePasswordValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()
/**
 * @description Change password of acccount.
 * @path /api/users/change-password
 * @method PUT
 * @body { oldPassword: string, newPassword: string, confirmNewPassword: string }
 * @returns {Object} Response object with message.
 */
usersRouter.patch(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
