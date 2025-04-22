import { Router } from 'express'
import {
  createBudgetController,
  getUserBudgetByIdController,
  getUserBudgetController
} from '~/controllers/budgets.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { createBudgetValidator, getUserBudgetByIdValidator } from '~/middlewares/budgets.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const budgetsRouter = Router()
/**
 * @description Create new user budget.
 * @path /api/budgets/budget
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { money_accounts: string[], transaction_type_categories: string[], name: string,
 *  amount_of_money: number, start_date: date, end_date: date }
 * @returns {Object} Response object with message.
 */
budgetsRouter.post('/budget', accessTokenValidator, createBudgetValidator, wrapRequestHandler(createBudgetController))
/**
 * @description Get user budget.
 * @path /api/budgets/budget
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
budgetsRouter.get('/budget', accessTokenValidator, wrapRequestHandler(getUserBudgetController))
/**
 * @description Get user budget by id.
 * @path /api/budgets/budget/:id
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @params { id: string }
 * @returns {Object} Response object with message and data.
 */
budgetsRouter.get(
  '/budget/:id',
  accessTokenValidator,
  getUserBudgetByIdValidator,
  wrapRequestHandler(getUserBudgetByIdController)
)

export default budgetsRouter
