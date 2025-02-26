import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateTransactionTypeBodyType, CreateTransactionTypeResType } from '~/schemaValidations/admins.schema'
import adminsService from '~/services/admins.service'

export const createTransactionTypeController = async (
  req: Request<ParamsDictionary, any, CreateTransactionTypeBodyType>,
  res: Response<CreateTransactionTypeResType>,
  next: NextFunction
) => {
  await adminsService.createTransactionType(req.body)
  return res.json({ message: ADMINS_MESSAGES.ADD_TRANSACTION_TYPE_SUCCESS })
}
