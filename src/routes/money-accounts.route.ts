import { Router } from 'express'
import {
  createMoneyAccountController,
  deleteUserMoneyAccountByIdController,
  getUserMoneyAccountByIdController,
  getUserMoneyAccountController,
  updateUserMoneyAccountController
} from '~/controllers/money-accounts.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import {
  createMoneyAccountValidator,
  getUserMoneyAccountByIdValidator,
  updateUserMoneyAccountValidator
} from '~/middlewares/money-accounts.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const moneyAccountsRouter = Router()
/**
 * @description Create new money account for user.
 * @path /api/apps/money-account
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { money_account_type_id: string, name: string, initial_balance: number,
 *  save_to_report?: boolean, bank_type?: number, credit_limit?: number, description?: string,
 *  reminder_when_due?: boolean, payment_due_date?: number, reminder_time?: string[] }
 * @returns {Object} Response object with message.
 */
moneyAccountsRouter.post(
  '/money-account',
  accessTokenValidator,
  createMoneyAccountValidator,
  wrapRequestHandler(createMoneyAccountController)
)
/**
 * @description Get user's money account.
 * @path /api/apps/money-account
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
moneyAccountsRouter.get('/money-account', accessTokenValidator, wrapRequestHandler(getUserMoneyAccountController))
/**
 * @description Get money account by id.
 * @path /api/apps/money-account/:id
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
moneyAccountsRouter.get(
  '/money-account/:id',
  accessTokenValidator,
  getUserMoneyAccountByIdValidator,
  wrapRequestHandler(getUserMoneyAccountByIdController)
)
/**
 * @description Delete money account by id.
 * @path /api/apps/money-account/:id
 * @method DELETE
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message.
 */
moneyAccountsRouter.delete(
  '/money-account/:id',
  accessTokenValidator,
  getUserMoneyAccountByIdValidator,
  wrapRequestHandler(deleteUserMoneyAccountByIdController)
)
/**
 * @description Update money account by id.
 * @path /api/apps/money-account
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, money_account_type_id: string, name: string, initial_balance: number,
 *  save_to_report?: boolean, bank_type?: number, credit_limit?: number, description?: string,
 *  reminder_when_due?: boolean, payment_due_date?: number, reminder_time?: string[] }
 * @returns {Object} Response object with message.
 */
moneyAccountsRouter.patch(
  '/money-account',
  accessTokenValidator,
  updateUserMoneyAccountValidator,
  wrapRequestHandler(updateUserMoneyAccountController)
)

export default moneyAccountsRouter
