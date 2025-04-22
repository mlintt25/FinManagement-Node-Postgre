import { Router } from 'express'
import { createBudgetController } from '~/controllers/budgets.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { createBudgetValidator } from '~/middlewares/budgets.middleware'
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

export default budgetsRouter
