import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateTransactionTypeBody } from '~/schemaValidations/admins.schema'
import { EntityError } from '~/utils/errors'

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
