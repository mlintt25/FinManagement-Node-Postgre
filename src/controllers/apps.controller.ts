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
  CreateMoneyAccountResType,
  CreateTransactionBodyType,
  CreateTransactionResType,
  DeleteUserMoneyAccountByIdResType,
  GetUserMoneyAccountByIdParamsType,
  GetUserMoneyAccountByIdResType,
  GetUserMoneyAccountResType,
  GetUserTransactionByIdParamsType,
  GetUserTransactionByIdResType,
  UpdateUserMoneyAccountBodyType,
  UpdateUserMoneyAccountResType
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

export const createTransactionController = async (
  req: Request<ParamsDictionary, any, CreateTransactionBodyType>,
  res: Response<CreateTransactionResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await appsService.createTransaction(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_TRANSACTION_SUCCESS })
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

export const getUserMoneyAccountController = async (
  req: Request,
  res: Response<GetUserMoneyAccountResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await appsService.getUserMoneyAccount(user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_MONEY_ACCOUNT_SUCCESS, data: result })
}

export const getUserMoneyAccountByIdController = async (
  req: Request<GetUserMoneyAccountByIdParamsType>,
  res: Response<GetUserMoneyAccountByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await appsService.getUserMoneyAccountById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_MONEY_ACCOUNT_BY_ID_SUCCESS, data: result })
}

export const deleteUserMoneyAccountByIdController = async (
  req: Request<GetUserMoneyAccountByIdParamsType>,
  res: Response<DeleteUserMoneyAccountByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await appsService.deleteUserMoneyAccountById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.DELETE_USER_MONEY_ACCOUNT_BY_ID_SUCCESS })
}

export const updateUserMoneyAccountController = async (
  req: Request<ParamsDictionary, any, UpdateUserMoneyAccountBodyType>,
  res: Response<UpdateUserMoneyAccountResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await appsService.updateUserMoneyAccount(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.UPDATE_USER_MONEY_ACCOUNT_SUCCESS })
}

export const getUserTransactionByIdController = async (
  req: Request<GetUserTransactionByIdParamsType>,
  res: Response<GetUserTransactionByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await appsService.getUserTransactionById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_TRANSACTION_BY_ID_SUCCESS, data: result })
}
