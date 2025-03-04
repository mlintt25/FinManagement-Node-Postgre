import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBody } from '~/schemaValidations/admins.schema'
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
