import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES, APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBody } from '~/schemaValidations/admins.schema'
import {
  CreateTransactionBody,
  GetUserTransactionByIdParams,
  GetUserTransactionByTimeQuery,
  UpdateUserTransactionBody
} from '~/schemaValidations/transactions.schema'
import { EntityError } from '~/utils/errors'
import { parse, isMatch } from 'date-fns'
import { convertDateFormat } from '~/utils/utils'

export const createTransactionTypeCategoryValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateTransactionTypeCategoryBody.parse(req.body)
    const { transaction_type_id, parent_id, name } = validatedData

    const [transactionType, transactionTypeCategory] = await Promise.all([
      prisma.transaction_types.findUnique({ where: { id: transaction_type_id } }),
      prisma.transaction_type_categories.findFirst({ where: { name } })
    ])

    if (!transactionType) {
      throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_NOT_FOUND, field: 'transaction_type_id' }])
    }

    if (transactionTypeCategory) {
      throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_CATEGORY_ALREADY_EXISTS, field: 'name' }])
    }
    // Check if parent_id is not empty
    if (parent_id) {
      const parentTransactionTypeCategory = await prisma.transaction_type_categories.findUnique({
        where: { id: parent_id }
      })
      if (!parentTransactionTypeCategory) {
        throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_CATEGORY_NOT_FOUND, field: 'parent_id' }])
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const createTransactionValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateTransactionBody.parse(req.body)
    const { money_account_id, transaction_type_category_id, event_id } = validatedData

    const [moneyAccount, transactionTypeCategory] = await Promise.all([
      prisma.money_accounts.findUnique({ where: { id: money_account_id } }),
      prisma.transaction_type_categories.findUnique({ where: { id: transaction_type_category_id } })
    ])

    if (!moneyAccount) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_NOT_FOUND, field: 'money_account_id' }])
    }

    if (!transactionTypeCategory) {
      throw new EntityError([
        { message: APPS_MESSAGES.TRANSACTION_TYPE_CATEGORY_NOT_FOUND, field: 'transaction_type_category_id' }
      ])
    }

    if (event_id) {
      const event = await prisma.events.findUnique({ where: { id: event_id } })
      if (!event) {
        throw new EntityError([{ message: APPS_MESSAGES.EVENT_NOT_FOUND, field: 'event_id' }])
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const getUserTransactionByIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GetUserTransactionByIdParams.parse(req.params)
    const { id } = validatedData
    // Only choose transactions that are not deleted (deleted_at is soft delete)
    const transaction = await prisma.transactions.findUnique({ where: { id, deleted_at: null } })
    if (!transaction) {
      throw new EntityError([{ message: APPS_MESSAGES.TRANSACTION_NOT_FOUND, field: 'id' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const getUserTransactionByTimeValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GetUserTransactionByTimeQuery.parse(req.query)
    const { from, to } = validatedData
    // Always convert date format to YYYY-MM-DD
    const dateFormat = 'yyyy-mm-dd'
    const isDateFormat = isMatch(from, dateFormat)

    if (!isDateFormat) {
      req.query.from = convertDateFormat(from)
      req.query.to = convertDateFormat(to)
    }

    const fromDate = new Date(req.query.from as string)
    const toDate = new Date(req.query.to as string)
    if (fromDate > toDate) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_DATE_RANGE, field: 'from' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const updateUserTransactionValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdateUserTransactionBody.parse(req.body)
    const { id, money_account_id, transaction_type_category_id, event_id } = validatedData

    const [transaction, moneyAccount, transactionTypeCategory] = await Promise.all([
      prisma.transactions.findUnique({ where: { id } }),
      prisma.money_accounts.findUnique({ where: { id: money_account_id } }),
      prisma.transaction_type_categories.findUnique({ where: { id: transaction_type_category_id } })
    ])

    if (!transaction) {
      throw new EntityError([{ message: APPS_MESSAGES.TRANSACTION_NOT_FOUND, field: 'id' }])
    }

    if (!moneyAccount) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_NOT_FOUND, field: 'money_account_id' }])
    }

    if (!transactionTypeCategory) {
      throw new EntityError([
        { message: APPS_MESSAGES.TRANSACTION_TYPE_CATEGORY_NOT_FOUND, field: 'transaction_type_category_id' }
      ])
    }

    if (event_id) {
      const event = await prisma.events.findUnique({ where: { id: event_id } })
      if (!event) {
        throw new EntityError([{ message: APPS_MESSAGES.EVENT_NOT_FOUND, field: 'event_id' }])
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}
