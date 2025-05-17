import { Router } from 'express'
import {
  createMoneyAccountTypeController,
  createTransactionTypeController,
  getAllMoneyAccountTypeController,
  getAllUsersController
} from '~/controllers/admins.controller'
import {
  adminRoleValidator,
  createMoneyAccountTypeValidator,
  createTransactionTypeValidator
} from '~/middlewares/admins.middleware'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const adminsRouter = Router()
/**
 * @description Create new transaction type.
 * @path /api/admins/transaction-type
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { icon: string, name: string, type: string (enum: Expense, Income) }
 * @returns {Object} Response object with message.
 */
adminsRouter.post(
  '/transaction-type',
  accessTokenValidator,
  adminRoleValidator,
  createTransactionTypeValidator,
  wrapRequestHandler(createTransactionTypeController)
)
/**
 * @description Create new money account type.
 * @path /api/admins/money-account-type
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { icon: string, name: string }
 * @returns {Object} Response object with message.
 */
adminsRouter.post(
  '/money-account-type',
  accessTokenValidator,
  adminRoleValidator,
  createMoneyAccountTypeValidator,
  wrapRequestHandler(createMoneyAccountTypeController)
)
/**
 * @description Get all money account types.
 * @path /api/admins/money-account-types
 * @method GET
 * @returns {Object} Response object with message and data.
 */
adminsRouter.get('/money-account-types', wrapRequestHandler(getAllMoneyAccountTypeController))
/**
 * @description Get all users.
 * @path /api/admins/users
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
adminsRouter.get('/users', accessTokenValidator, adminRoleValidator, wrapRequestHandler(getAllUsersController))

export default adminsRouter
