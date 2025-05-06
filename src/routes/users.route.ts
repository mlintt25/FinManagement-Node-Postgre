import { Router } from 'express'
import {
  changePasswordController,
  createUserPersonalizationController,
  updateUserPersonalizationController,
  getUserPersonalizationController
} from '~/controllers/users.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import {
  changePasswordValidator,
  createUserPersonalizationValidator,
  updateUserPersonalizationValidator,
  getUserPersonalizationValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()
/**
 * @description Change password of acccount.
 * @path /api/users/change-password
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { oldPassword: string, newPassword: string, confirmNewPassword: string }
 * @returns {Object} Response object with message.
 */
usersRouter.patch(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)
/**
 * @description Get user personalization by user id.
 * @path /api/users/personalization
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
usersRouter.get(
  '/personalization',
  accessTokenValidator,
  getUserPersonalizationValidator,
  wrapRequestHandler(getUserPersonalizationController)
)
/**
 * @description Create new user personalization.
 * @path /api/users/personalization
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { occupation: string, monthly_income: number, financial_goals: string[] }
 * @returns {Object} Response object with message.
 */
usersRouter.post(
  '/personalization',
  accessTokenValidator,
  createUserPersonalizationValidator,
  wrapRequestHandler(createUserPersonalizationController)
)
/**
 * @description Update user personalization.
 * @path /api/users/personalization
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, occupation: string, monthly_income: number, financial_goals: string[] }
 * @returns {Object} Response object with message.
 */
usersRouter.patch(
  '/personalization',
  accessTokenValidator,
  updateUserPersonalizationValidator,
  wrapRequestHandler(updateUserPersonalizationController)
)

export default usersRouter
