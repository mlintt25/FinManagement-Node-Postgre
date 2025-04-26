import { isMatch } from 'date-fns'
import { Request, Response, NextFunction } from 'express'
import { APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateBudgetBody, GetUserBudgetByIdParams, UpdateUserBudgetBody } from '~/schemaValidations/budgets.schema'
import { TokenPayload } from '~/types/jwt.type'
import { EntityError } from '~/utils/errors'
import { convertDateFormat } from '~/utils/utils'

export const createBudgetValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateBudgetBody.parse(req.body)
    const { money_accounts, transaction_type_categories, name, start_date, end_date } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload
    /**
     * Handle cases:
     * 1. Check format yyyy-mm-dd or dd-mm-yyyy
     * 2. If dd-mm-yyyy -> convert to yyyy-mm-dd nad set end_date to 23:59:59
     * 3. Start date must be less than end date
     * 4. If budget name exists for that user, the start date and end date
     *  must not overlap with the existing budget
     * 5. Money account ID(s) must exist in the database
     * 6. Transaction type category ID(s) must exist in the database
     */
    const dateFormat = 'yyyy-mm-dd'
    const isStartDateFormat = isMatch(start_date, dateFormat)
    const isEndDateFormat = isMatch(end_date, dateFormat)
    let convertStartDate = start_date
    let convertEndDate = end_date

    if (!isStartDateFormat) {
      convertStartDate = convertDateFormat(start_date)
    }
    if (!isEndDateFormat) {
      convertEndDate = convertDateFormat(end_date)
    }

    const fromDate = new Date(convertStartDate)
    const toDate = new Date(convertEndDate)
    toDate.setUTCHours(23, 59, 59, 999)

    if (fromDate > toDate) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_DATE_RANGE, field: 'start_date' }])
    }

    const [isOverlapBudget, countMoneyAccounts, countTransactionTypes] = await Promise.all([
      prisma.budgets.findFirst({
        where: {
          name,
          user_id,
          start_date: {
            lte: toDate
          },
          end_date: {
            gte: fromDate
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
    // Reassign value to date into req.body after formatting
    req.body.start_date = fromDate
    req.body.end_date = toDate

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

export const updateUserBudgetValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdateUserBudgetBody.parse(req.body)
    const { id, money_accounts, transaction_type_categories, name, start_date, end_date } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload
    /**
     * Handle cases:
     * 1. Check id exists in the database
     * 2. Check format yyyy-mm-dd or dd-mm-yyyy
     * 3. If dd-mm-yyyy -> convert to yyyy-mm-dd nad set end_date to 23:59:59
     * 4. Start date must be less than end date
     * 5. If budget name exists for that user, the start date and end date
     *  must not overlap with the existing budget
     * 6. Money account ID(s) must exist in the database
     * 7. Transaction type category ID(s) must exist in the database
     */
    const dateFormat = 'yyyy-mm-dd'
    const isStartDateFormat = isMatch(start_date, dateFormat)
    const isEndDateFormat = isMatch(end_date, dateFormat)
    let convertStartDate = start_date
    let convertEndDate = end_date

    if (!isStartDateFormat) {
      convertStartDate = convertDateFormat(start_date)
    }
    if (!isEndDateFormat) {
      convertEndDate = convertDateFormat(end_date)
    }

    const fromDate = new Date(convertStartDate)
    const toDate = new Date(convertEndDate)
    toDate.setUTCHours(23, 59, 59, 999)

    if (fromDate > toDate) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_DATE_RANGE, field: 'start_date' }])
    }

    const [budget, isOverlapBudget, countMoneyAccounts, countTransactionTypes] = await Promise.all([
      prisma.budgets.findUnique({
        where: {
          id,
          user_id
        }
      }),
      prisma.budgets.findFirst({
        where: {
          name,
          user_id,
          start_date: {
            lte: toDate
          },
          end_date: {
            gte: fromDate
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

    if (!budget) {
      throw new EntityError([{ message: APPS_MESSAGES.BUDGET_NOT_FOUND, field: 'id' }])
    }

    if (
      budget.name !== name ||
      budget.start_date.getTime() !== fromDate.getTime() ||
      budget.end_date.getTime() !== toDate.getTime()
    ) {
      if (isOverlapBudget) {
        throw new EntityError([
          { message: APPS_MESSAGES.BUDGET_DATE_OVERLAP, field: 'start_date' },
          { message: APPS_MESSAGES.BUDGET_DATE_OVERLAP, field: 'end_date' },
          { message: APPS_MESSAGES.BUDGET_DATE_OVERLAP, field: 'name' }
        ])
      }
    }

    if (countMoneyAccounts !== money_accounts.length) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_MONEY_ACCOUNT_ID, field: 'money_accounts' }])
    }

    if (countTransactionTypes !== transaction_type_categories.length) {
      throw new EntityError([
        { message: APPS_MESSAGES.INVALID_TRANSACTION_TYPE_ID, field: 'transaction_type_categories' }
      ])
    }
    // Reassign value to date into req.body after formatting
    req.body.start_date = fromDate
    req.body.end_date = toDate

    next()
  } catch (error) {
    next(error)
  }
}
