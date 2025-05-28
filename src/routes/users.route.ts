import { Router } from 'express'
import {
  changePasswordController,
  createUserPersonalizationController,
  updateUserPersonalizationController,
  getUserPersonalizationController,
  getUserPersonalizationStatusController,
  getUserPersonalizationToChatbotController,
  getMeController
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
 * @description Get user information.
 * @path /api/users/me
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
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
 * @description Get user personalization status by user id.
 * @path /api/users/personalization/status
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
usersRouter.get(
  '/personalization/status',
  accessTokenValidator,
  wrapRequestHandler(getUserPersonalizationStatusController)
)
/**
 * @description Get user personalization data to request chatbot by user id.
 * @path /api/users/personalization/data-chatbot
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
usersRouter.get(
  '/personalization/data-chatbot',
  accessTokenValidator,
  getUserPersonalizationValidator,
  wrapRequestHandler(getUserPersonalizationToChatbotController)
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
