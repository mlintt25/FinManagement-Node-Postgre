import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { APPS_MESSAGES } from '~/constants/messages'
import appsService from '~/services/apps.service'
import { TokenPayload } from '~/types/jwt.type'
import {
  CreateTransactionTypeCategoryBodyType,
  CreateTransactionTypeCategoryResType
} from '~/schemaValidations/admins.schema'
import {
  AllTransactionTypeCategoriesResType,
  CreateMoneyAccountBodyType,
  CreateMoneyAccountResType
} from '~/schemaValidations/apps.schema'

export const getAllTransactionTypeCategoryController = async (
  req: Request,
  res: Response<AllTransactionTypeCategoriesResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await appsService.getAllTransactionTypeCategory(user_id)
  return res.json({ message: APPS_MESSAGES.GET_TRANSACTION_TYPE_CATEGORIES_SUCCESS, data: result })
}

export const createTransactionTypeCategoryController = async (
  req: Request<ParamsDictionary, any, CreateTransactionTypeCategoryBodyType>,
  res: Response<CreateTransactionTypeCategoryResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await appsService.createTransactionTypeCategory(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_TRANSACTION_TYPE_CATEGORY_SUCCESS })
}

export const createMoneyAccountController = async (
  req: Request<ParamsDictionary, any, CreateMoneyAccountBodyType>,
  res: Response<CreateMoneyAccountResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await appsService.createMoneyAccount(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_MONEY_ACCOUNT_SUCCESS })
}
