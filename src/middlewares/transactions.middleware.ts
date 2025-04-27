import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES, APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import {
  CreateTransactionTypeCategoryBody,
  GetTransactionTypeCategoryByIdParams,
  UpdateTransactionTypeCategoryBody
} from '~/schemaValidations/admins.schema'
import {
  CreateTransactionBody,
  GetUserTransactionByIdParams,
  GetUserTransactionByTimeQuery,
  UpdateUserTransactionBody
} from '~/schemaValidations/transactions.schema'
import { EntityError, ForbiddenError } from '~/utils/errors'
import { isMatch } from 'date-fns'
import { convertDateFormat } from '~/utils/utils'
import { TokenPayload } from '~/types/jwt.type'
import { Role } from '~/constants/enums'

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

export const updateTransactionTypeCategoryValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdateTransactionTypeCategoryBody.parse(req.body)
    const { id, transaction_type_id, parent_id, name } = validatedData

    const [transactionTypeCategory, transactionType, transactionTypeCategoryExist] = await Promise.all([
      prisma.transaction_type_categories.findUnique({ where: { id } }),
      prisma.transaction_types.findUnique({ where: { id: transaction_type_id } }),
      prisma.transaction_type_categories.findFirst({ where: { name } })
    ])

    if (!transactionTypeCategory) {
      throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_CATEGORY_NOT_FOUND, field: 'id' }])
    }

    if (transactionTypeCategory.name !== name) {
      if (transactionTypeCategoryExist) {
        throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_CATEGORY_ALREADY_EXISTS, field: 'name' }])
      }
    }

    if (!transactionType) {
      throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_NOT_FOUND, field: 'transaction_type_id' }])
    }

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

export const getTransactionTypeCategoryByIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GetTransactionTypeCategoryByIdParams.parse(req.params)
    const { id } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload

    const transactionTypeCategory = await prisma.transaction_type_categories.findUnique({ where: { id } })
    if (!transactionTypeCategory) {
      throw new EntityError([{ message: APPS_MESSAGES.TRANSACTION_TYPE_CATEGORY_NOT_FOUND, field: 'id' }])
    }

    const user = await prisma.users.findUnique({
      where: { id: user_id },
      select: { id: true, role: true }
    })

    if (user!.role === Role.User && transactionTypeCategory.user_id !== user!.id) {
      throw new ForbiddenError(APPS_MESSAGES.NOT_AUTHORIZED_TO_PERFORM_THIS_ACTION)
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
    const { from, to, money_account_id } = validatedData

    if ((from && !to) || (!from && to)) {
      throw new EntityError([{ message: APPS_MESSAGES.MUST_NOT_EMPTY_BOTH_FROM_DATE_AND_TO_DATE, field: 'from' }])
    }

    if (money_account_id) {
      const moneyAccount = await prisma.money_accounts.findUnique({ where: { id: money_account_id } })
      if (!moneyAccount) {
        throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_NOT_FOUND, field: 'money_account_id' }])
      }
    }

    if (from && to) {
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
