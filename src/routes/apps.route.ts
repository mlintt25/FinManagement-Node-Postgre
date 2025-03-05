import { Router } from 'express'
import {
  createMoneyAccountController,
  createTransactionTypeCategoryController,
  getAllTransactionTypeCategoryController
} from '~/controllers/apps.controller'
import { createMoneyAccountValidator, createTransactionTypeCategoryValidator } from '~/middlewares/apps.middleware'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const appsRouter = Router()
/**
 * @description Get all transaction type categories.
 * @path /api/apps/transaction-type-categories
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
appsRouter.get(
  '/transaction-type-categories',
  accessTokenValidator,
  wrapRequestHandler(getAllTransactionTypeCategoryController)
)
/**
 * @description Create new transaction type category for user.
 * @path /api/apps/transaction-type-category
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { transaction_type_id: string, icon: string, name: string, parent_id?: string }
 * @returns {Object} Response object with message.
 */
appsRouter.post(
  '/transaction-type-category',
  accessTokenValidator,
  createTransactionTypeCategoryValidator,
  wrapRequestHandler(createTransactionTypeCategoryController)
)
/**
 * @description Create new money account for user.
 * @path /api/apps/money-account
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { money_account_type_id: string, name: string, account_balance: number,
 *  save_to_report?: boolean, bank_type?: number, credit_limit?: number, description?: string }
 * @returns {Object} Response object with message.
 */
appsRouter.post(
  '/money-account',
  accessTokenValidator,
  createMoneyAccountValidator,
  wrapRequestHandler(createMoneyAccountController)
)

export default appsRouter
