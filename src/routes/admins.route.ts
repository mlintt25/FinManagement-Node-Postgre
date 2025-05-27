import { Router } from 'express'
import {
  changeUserVerifyStatusByIdController,
  createMoneyAccountTypeController,
  createTransactionTypeController,
  getAllMoneyAccountTypeController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController
} from '~/controllers/admins.controller'
import {
  adminRoleValidator,
  createMoneyAccountTypeValidator,
  createTransactionTypeValidator,
  getUserByIdValidator,
  changeUserVerifyStatusByIdValidator,
  updateUserByIdValidator
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
/**
 * @description Get user by id.
 * @path /api/admins/user/:id
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @params { id: string }
 * @returns {Object} Response object with message and data.
 */
adminsRouter.get(
  '/user/:id',
  accessTokenValidator,
  adminRoleValidator,
  getUserByIdValidator,
  wrapRequestHandler(getUserByIdController)
)
/**
 * @description Update user by id.
 * @path /api/admins/user
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, name: string, email: string, role: string, phone: string,
 *  avatar: string, dob: date, address: string, gender: string, job: string, verify: string }
 * @returns {Object} Response object with message.
 */
adminsRouter.patch(
  '/user',
  accessTokenValidator,
  adminRoleValidator,
  updateUserByIdValidator,
  wrapRequestHandler(updateUserByIdController)
)
/**
 * @description Change user verification status by id.
 * @path /api/admins/user/verify
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, verify: string }
 * @returns {Object} Response object with message.
 */
adminsRouter.patch(
  '/user/verify',
  accessTokenValidator,
  adminRoleValidator,
  changeUserVerifyStatusByIdValidator,
  wrapRequestHandler(changeUserVerifyStatusByIdController)
)

export default adminsRouter
