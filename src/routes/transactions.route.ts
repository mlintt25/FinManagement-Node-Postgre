import { Router } from 'express'
import {
  createTransactionController,
  createTransactionTypeCategoryController,
  getAllTransactionTypeCategoryController,
  getUserTransactionByIdController,
  deleteUserTransactionByIdController,
  updateUserTransactionController,
  getUserTransactionByTimeController,
  updateTransactionTypeCategoryController
} from '~/controllers/transactions.controller'
import {
  createTransactionTypeCategoryValidator,
  createTransactionValidator,
  getUserTransactionByIdValidator,
  updateUserTransactionValidator,
  getUserTransactionByTimeValidator,
  updateTransactionTypeCategoryValidator
} from '~/middlewares/transactions.middleware'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const transactionsRouter = Router()
/**
 * @description Get all transaction type categories.
 * @path /api/transactions/transaction-type-categories
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
transactionsRouter.get(
  '/transaction-type-categories',
  accessTokenValidator,
  wrapRequestHandler(getAllTransactionTypeCategoryController)
)
/**
 * @description Create new transaction type category for user.
 * @path /api/transactions/transaction-type-category
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { transaction_type_id: string, icon: string, name: string, parent_id?: string }
 * @returns {Object} Response object with message.
 */
transactionsRouter.post(
  '/transaction-type-category',
  accessTokenValidator,
  createTransactionTypeCategoryValidator,
  wrapRequestHandler(createTransactionTypeCategoryController)
)
/**
 * @description Update user transaction type category by id.
 * @path /api/transactions/transaction-type-category
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, transaction_type_id: string, icon: string, name: string, parent_id?: string }
 * @returns {Object} Response object with message.
 */
transactionsRouter.patch(
  '/transaction-type-category',
  accessTokenValidator,
  updateTransactionTypeCategoryValidator,
  wrapRequestHandler(updateTransactionTypeCategoryController)
)
/**
 * @description Create new user's transaction.
 * @path /api/transactions/transaction
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { transaction_type_category_id: string, money_account_id: string, amount_of_money: number,
 *  occur_date: date, event_id?: string, description?: string, related_party?: string, reminder_date?: date }
 * @returns {Object} Response object with message.
 */
transactionsRouter.post(
  '/transaction',
  accessTokenValidator,
  createTransactionValidator,
  wrapRequestHandler(createTransactionController)
)
/**
 * @description Get user's transaction by id.
 * @path /api/transactions/transaction/:id
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @params { id: string }
 * @returns {Object} Response object with message and data.
 */
transactionsRouter.get(
  '/transaction/:id',
  accessTokenValidator,
  getUserTransactionByIdValidator,
  wrapRequestHandler(getUserTransactionByIdController)
)
/**
 * @description Get user's transaction by time.
 * @path /api/transactions/transaction
 * @path /api/transactions/transaction?from=<date>&to=<date>&money_account_id=<string>
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @query { from: date, to: date }
 * @returns {Object} Response object with message and data.
 */
transactionsRouter.get(
  '/transaction',
  accessTokenValidator,
  getUserTransactionByTimeValidator,
  wrapRequestHandler(getUserTransactionByTimeController)
)
/**
 * @description Delete user's transaction by id.
 * @path /api/transactions/transaction/:id
 * @method DELETE
 * @header { Authorization: Bearer <access_token> }
 * @params { id: string }
 * @returns {Object} Response object with message.
 */
transactionsRouter.delete(
  '/transaction/:id',
  accessTokenValidator,
  getUserTransactionByIdValidator,
  wrapRequestHandler(deleteUserTransactionByIdController)
)
/**
 * @description Update user's transaction by id.
 * @path /api/transactions/transaction
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, transaction_type_category_id: string, money_account_id: string, amount_of_money: number,
 *  occur_date: date, event_id?: string, description?: string, related_party?: string, reminder_date?: date }
 * @returns {Object} Response object with message.
 */
transactionsRouter.patch(
  '/transaction',
  accessTokenValidator,
  updateUserTransactionValidator,
  wrapRequestHandler(updateUserTransactionController)
)

export default transactionsRouter
