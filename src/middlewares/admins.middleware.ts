import { Request, Response, NextFunction } from 'express'
import { Role } from '~/constants/enums'
import { ADMINS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateMoneyAccountTypeBody, CreateTransactionTypeBody } from '~/schemaValidations/admins.schema'
import { TokenPayload } from '~/types/jwt.type'
import { AuthError, EntityError } from '~/utils/errors'

export const adminRoleValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.decodedAccessToken as TokenPayload
    const user = (await prisma.users.findUnique({
      where: { id: user_id },
      select: { role: true }
    })) as { role: string }

    if (user.role !== Role.Admin) {
      throw new AuthError(ADMINS_MESSAGES.UNAUTHORIZED)
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const createTransactionTypeValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateTransactionTypeBody.parse(req.body)
    const { name } = validatedData

    const transactionType = await prisma.transaction_types.findFirst({ where: { name } })
    if (transactionType) {
      throw new EntityError([{ message: ADMINS_MESSAGES.TRANSACTION_TYPE_ALREADY_EXISTS, field: 'name' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const createMoneyAccountTypeValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateMoneyAccountTypeBody.parse(req.body)
    const { name } = validatedData

    const moneyAccountType = await prisma.money_account_types.findFirst({ where: { name } })
    if (moneyAccountType) {
      throw new EntityError([{ message: ADMINS_MESSAGES.MONEY_ACCOUNT_TYPE_ALREADY_EXISTS, field: 'name' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}
