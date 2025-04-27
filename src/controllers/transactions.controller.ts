import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { APPS_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/types/jwt.type'
import {
  CreateTransactionTypeCategoryBodyType,
  CreateTransactionTypeCategoryResType,
  UpdateTransactionTypeCategoryBodyType,
  UpdateTransactionTypeCategoryResType
} from '~/schemaValidations/admins.schema'
import {
  AllTransactionTypeCategoriesResType,
  CreateTransactionBodyType,
  CreateTransactionResType,
  DeleteUserTransactionByIdResType,
  GetUserTransactionByIdParamsType,
  GetUserTransactionByIdResType,
  GetUserTransactionByTimeQueryType,
  GetUserTransactionByTimeResType,
  UpdateUserTransactionBodyType,
  UpdateUserTransactionResType
} from '~/schemaValidations/transactions.schema'
import transactionsService from '~/services/transactions.service'

export const getAllTransactionTypeCategoryController = async (
  req: Request,
  res: Response<AllTransactionTypeCategoriesResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await transactionsService.getAllTransactionTypeCategory(user_id)
  return res.json({ message: APPS_MESSAGES.GET_TRANSACTION_TYPE_CATEGORIES_SUCCESS, data: result })
}

export const createTransactionTypeCategoryController = async (
  req: Request<ParamsDictionary, any, CreateTransactionTypeCategoryBodyType>,
  res: Response<CreateTransactionTypeCategoryResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await transactionsService.createTransactionTypeCategory(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_TRANSACTION_TYPE_CATEGORY_SUCCESS })
}

export const updateTransactionTypeCategoryController = async (
  req: Request<ParamsDictionary, any, UpdateTransactionTypeCategoryBodyType>,
  res: Response<UpdateTransactionTypeCategoryResType>,
  next: NextFunction
) => {
  await transactionsService.updateTransactionTypeCategory(req.body)
  return res.json({ message: APPS_MESSAGES.UPDATE_TRANSACTION_TYPE_CATEGORY_SUCCESS })
}

export const createTransactionController = async (
  req: Request<ParamsDictionary, any, CreateTransactionBodyType>,
  res: Response<CreateTransactionResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await transactionsService.createTransaction(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_TRANSACTION_SUCCESS })
}

export const getUserTransactionByIdController = async (
  req: Request<GetUserTransactionByIdParamsType>,
  res: Response<GetUserTransactionByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await transactionsService.getUserTransactionById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_TRANSACTION_BY_ID_SUCCESS, data: result })
}

export const getUserTransactionByTimeController = async (
  req: Request<ParamsDictionary, any, any, GetUserTransactionByTimeQueryType>,
  res: Response<GetUserTransactionByTimeResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await transactionsService.getUserTransactionByTime(req.query, user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_TRANSACTION_BY_TIME_SUCCESS, data: result })
}

export const deleteUserTransactionByIdController = async (
  req: Request<GetUserTransactionByIdParamsType>,
  res: Response<DeleteUserTransactionByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await transactionsService.softDeleteUserTransactionById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.SOFT_DELETE_USER_TRANSACTION_BY_ID_SUCCESS })
}

export const updateUserTransactionController = async (
  req: Request<ParamsDictionary, any, UpdateUserTransactionBodyType>,
  res: Response<UpdateUserTransactionResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await transactionsService.updateUserTransaction(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.UPDATE_TRANSACTION_SUCCESS })
}
