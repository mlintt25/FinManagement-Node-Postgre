import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  AllMoneyAccountTypeResType,
  CreateMoneyAccountTypeBodyType,
  CreateMoneyAccountTypeResType,
  CreateTransactionTypeBodyType,
  CreateTransactionTypeResType
} from '~/schemaValidations/admins.schema'
import adminsService from '~/services/admins.service'

export const createTransactionTypeController = async (
  req: Request<ParamsDictionary, any, CreateTransactionTypeBodyType>,
  res: Response<CreateTransactionTypeResType>,
  next: NextFunction
) => {
  await adminsService.createTransactionType(req.body)
  return res.json({ message: ADMINS_MESSAGES.ADD_TRANSACTION_TYPE_SUCCESS })
}

export const createMoneyAccountTypeController = async (
  req: Request<ParamsDictionary, any, CreateMoneyAccountTypeBodyType>,
  res: Response<CreateMoneyAccountTypeResType>,
  next: NextFunction
) => {
  await adminsService.createMoneyAccountType(req.body)
  return res.json({ message: ADMINS_MESSAGES.ADD_MONEY_ACCOUNT_TYPE_SUCCESS })
}

export const getAllMoneyAccountTypeController = async (
  req: Request,
  res: Response<AllMoneyAccountTypeResType>,
  next: NextFunction
) => {
  const result = await adminsService.getMoneyAccountType()
  return res.json({ message: ADMINS_MESSAGES.GET_MONEY_ACCOUNT_TYPES_SUCCESS, data: result })
}
