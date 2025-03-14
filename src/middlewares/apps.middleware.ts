import { Request, Response, NextFunction } from 'express'
import { MoneyAccountType } from '~/constants/enums'
import { ADMINS_MESSAGES, APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBody } from '~/schemaValidations/admins.schema'
import { CreateMoneyAccountBody, CreateTransactionBody } from '~/schemaValidations/apps.schema'
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

export const createMoneyAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateMoneyAccountBody.parse(req.body)
    const { credit_limit, bank_type, money_account_type_id, name, reminder_when_due, reminder_time, payment_due_date } =
      validatedData
    /**
     * Handle cases:
     * 1. Money account type exists
     * 2. Money account already exists
     * 3. isCredit -> Credit limit required
     * 4. !isCredit -> Credit limit not required
     * 5. !isBank && !isCredit && have bank_type -> Bank not required
     * 6. !isCredit && have one of reminder_when_due, reminder_time, payment_due_date (is the option of reminder_when_due)
     *   -> reminder_when_due not required
     * 7. reminder_when_due === true -> payment_due_date required, reminder_time required
     * 8. reminder_when_due === false -> payment_due_date not required, reminder_time not required
     */
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

    if ((isCredit && !credit_limit) || (!isCredit && credit_limit !== undefined)) {
      throw new EntityError([
        {
          message: isCredit ? APPS_MESSAGES.CREDIT_LIMIT_REQUIRED : APPS_MESSAGES.CREDIT_LIMIT_NOT_REQUIRED,
          field: 'credit_limit'
        }
      ])
    }

    if (!isBank && !isCredit && bank_type) {
      throw new EntityError([{ message: APPS_MESSAGES.BANK_NOT_REQUIRED, field: 'bank_type' }])
    }

    if (!isCredit && (reminder_when_due || reminder_time || payment_due_date)) {
      throw new EntityError([
        { message: APPS_MESSAGES.REMINDER_WHEN_DUE_NOT_REQUIRED_WHEN_NOT_CREDIT_CARD, field: 'reminder_when_due' }
      ])
    }

    if (reminder_when_due === true) {
      if (!payment_due_date) {
        throw new EntityError([{ message: APPS_MESSAGES.PAYMENT_DUE_DATE_REQUIRED, field: 'payment_due_date' }])
      }
      if (!reminder_time || reminder_time.length === 0) {
        throw new EntityError([{ message: APPS_MESSAGES.REMINDER_TIME_REQUIRED, field: 'reminder_time' }])
      }
    } else {
      if (payment_due_date || reminder_time) {
        throw new EntityError([{ message: APPS_MESSAGES.REMINDER_WHEN_DUE_REQUIRED, field: 'reminder_when_due' }])
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}
