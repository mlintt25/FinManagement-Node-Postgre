import { Request, Response, NextFunction } from 'express'
import { MoneyAccountType } from '~/constants/enums'
import { ADMINS_MESSAGES, APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBody } from '~/schemaValidations/admins.schema'
import { CreateMoneyAccountBody } from '~/schemaValidations/apps.schema'
import { EntityError } from '~/utils/errors'

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

export const createMoneyAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateMoneyAccountBody.parse(req.body)
    const { credit_limit, bank_type, money_account_type_id, name } = validatedData

    const [moneyAccountType, isMoneyAccountExist] = await Promise.all([
      prisma.money_account_types.findUnique({ where: { id: money_account_type_id } }),
      prisma.money_accounts.findFirst({ where: { name } })
    ])

    if (!moneyAccountType) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_TYPE_NOT_FOUND, field: 'money_account_type_id' }])
    }

    if (isMoneyAccountExist) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_ALREADY_EXISTS, field: 'name' }])
    }

    const isCredit = moneyAccountType.type === MoneyAccountType.Credit
    const isBank = moneyAccountType.type === MoneyAccountType.Bank

    if (isCredit && !credit_limit) {
      throw new EntityError([{ message: APPS_MESSAGES.CREDIT_LIMIT_REQUIRED, field: 'credit_limit' }])
    }

    if (!isCredit && credit_limit !== undefined) {
      throw new EntityError([{ message: APPS_MESSAGES.CREDIT_LIMIT_NOT_REQUIRED, field: 'credit_limit' }])
    }

    if (!isBank && bank_type) {
      throw new EntityError([{ message: APPS_MESSAGES.BANK_NOT_REQUIRED, field: 'bank_type' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}
