import { Request, Response, NextFunction } from 'express'
import { ADMINS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  AllMoneyAccountTypeResType,
  ChangeUserVerifyStatusByIdBodyType,
  ChangeUserVerifyStatusByIdResType,
  CreateMoneyAccountTypeBodyType,
  CreateMoneyAccountTypeResType,
  CreateTransactionTypeBodyType,
  CreateTransactionTypeResType,
  GetAllUsersResType,
  GetUserByIdParamsType,
  GetUserByIdResType,
  UpdateUserByIdBodyType,
  UpdateUserByIdResType
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
  const result = await adminsService.getAllMoneyAccountType()
  return res.json({ message: ADMINS_MESSAGES.GET_MONEY_ACCOUNT_TYPES_SUCCESS, data: result })
}

export const getAllUsersController = async (req: Request, res: Response<GetAllUsersResType>, next: NextFunction) => {
  const result = await adminsService.getAllUsers()
  return res.json({ message: ADMINS_MESSAGES.GET_USERS_SUCCESS, data: result })
}

export const getUserByIdController = async (
  req: Request<GetUserByIdParamsType>,
  res: Response<GetUserByIdResType>,
  next: NextFunction
) => {
  const result = await adminsService.getUserById(req.params)
  return res.json({ message: ADMINS_MESSAGES.GET_USER_BY_ID_SUCCESS, data: result })
}

export const changeUserVerifyStatusByIdController = async (
  req: Request<ParamsDictionary, any, ChangeUserVerifyStatusByIdBodyType>,
  res: Response<ChangeUserVerifyStatusByIdResType>,
  next: NextFunction
) => {
  await adminsService.changeUserVerifyStatusById(req.body)
  return res.json({ message: ADMINS_MESSAGES.CHANGE_USER_VERIFY_STATUS_SUCCESS })
}

export const updateUserByIdController = async (
  req: Request<ParamsDictionary, any, UpdateUserByIdBodyType>,
  res: Response<UpdateUserByIdResType>,
  next: NextFunction
) => {
  await adminsService.updateUserById(req.body)
  return res.json({ message: ADMINS_MESSAGES.UPDATE_USER_BY_ID_SUCCESS })
}
