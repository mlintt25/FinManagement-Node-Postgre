import { Request, Response, NextFunction } from 'express'
import { MoneyAccountType } from '~/constants/enums'
import { APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import {
  CreateMoneyAccountBody,
  GetUserMoneyAccountByIdParams,
  UpdateUserMoneyAccountBody
} from '~/schemaValidations/money-accounts.schema'
import { EntityError } from '~/utils/errors'

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

export const getUserMoneyAccountByIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GetUserMoneyAccountByIdParams.parse(req.params)
    const { id } = validatedData

    const moneyAccount = await prisma.money_accounts.findUnique({ where: { id } })
    if (!moneyAccount) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_NOT_FOUND, field: 'id' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const updateUserMoneyAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdateUserMoneyAccountBody.parse(req.body)
    const {
      id,
      credit_limit,
      bank_type,
      money_account_type_id,
      name,
      reminder_when_due,
      reminder_time,
      payment_due_date
    } = validatedData
    /**
     * Handle cases:
     * 1. Money account exists
     * 2. Check name if have any change
     * 3. isCredit -> Credit limit required
     * 4. !isCredit -> Credit limit not required
     * 5. !isBank && !isCredit && have bank_type -> Bank not required
     * 6. !isCredit && have one of reminder_when_due, reminder_time, payment_due_date (is the option of reminder_when_due)
     *   -> reminder_when_due not required
     * 7. reminder_when_due === true -> payment_due_date required, reminder_time required
     * 8. reminder_when_due === false -> payment_due_date not required, reminder_time not required
     */
    const moneyAccount = await prisma.money_accounts.findUnique({ where: { id } })
    if (!moneyAccount) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_NOT_FOUND, field: 'id' }])
    }

    if (name.toLowerCase() !== moneyAccount.name.toLowerCase()) {
      const isMoneyAccountExist = await prisma.money_accounts.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      })
      if (isMoneyAccountExist) {
        throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_ALREADY_EXISTS, field: 'name' }])
      }
    }

    const moneyAccountType = await prisma.money_account_types.findUnique({ where: { id: money_account_type_id } })

    if (!moneyAccountType) {
      throw new EntityError([{ message: APPS_MESSAGES.MONEY_ACCOUNT_TYPE_NOT_FOUND, field: 'money_account_type_id' }])
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
