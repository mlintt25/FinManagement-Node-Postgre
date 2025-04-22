import { Request, Response, NextFunction } from 'express'
import { APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateBudgetBody, GetUserBudgetByIdParams } from '~/schemaValidations/budgets.schema'
import { TokenPayload } from '~/types/jwt.type'
import { EntityError } from '~/utils/errors'

export const createBudgetValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateBudgetBody.parse(req.body)
    const { money_accounts, transaction_type_categories, name, start_date, end_date } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload
    /**
     * Handle cases:
     * 1. Start date must be less than end date
     * 2. If budget name exists for that user, the start date and end date
     *  must not overlap with the existing budget
     * 3. Money account ID(s) must exist in the database
     * 4. Transaction type category ID(s) must exist in the database
     */
    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)
    if (startDateObj > endDateObj) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_DATE_RANGE, field: 'start_date' }])
    }

    const [isOverlapBudget, countMoneyAccounts, countTransactionTypes] = await Promise.all([
      prisma.budgets.findFirst({
        where: {
          name,
          user_id,
          start_date: {
            lte: end_date
          },
          end_date: {
            gte: start_date
          }
        }
      }),
      prisma.money_accounts.count({
        where: {
          id: {
            in: money_accounts
          },
          user_id
        }
      }),
      prisma.transaction_type_categories.count({
        where: {
          id: {
            in: transaction_type_categories
          }
        }
      })
    ])

    if (isOverlapBudget) {
      throw new EntityError([
        { message: APPS_MESSAGES.BUDGET_DATE_OVERLAP, field: 'start_date' },
        { message: APPS_MESSAGES.BUDGET_DATE_OVERLAP, field: 'end_date' },
        { message: APPS_MESSAGES.BUDGET_DATE_OVERLAP, field: 'name' }
      ])
    }

    if (countMoneyAccounts !== money_accounts.length) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_MONEY_ACCOUNT_ID, field: 'money_accounts' }])
    }

    if (countTransactionTypes !== transaction_type_categories.length) {
      throw new EntityError([
        { message: APPS_MESSAGES.INVALID_TRANSACTION_TYPE_ID, field: 'transaction_type_categories' }
      ])
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const getUserBudgetByIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GetUserBudgetByIdParams.parse(req.params)
    const { id } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload

    const budget = await prisma.budgets.findUnique({ where: { id, user_id } })
    if (!budget) {
      throw new EntityError([{ message: APPS_MESSAGES.BUDGET_NOT_FOUND, field: 'id' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}
