import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { APPS_MESSAGES } from '~/constants/messages'
import {
  CreateMoneyAccountBodyType,
  CreateMoneyAccountResType,
  DeleteUserMoneyAccountByIdResType,
  GetUserMoneyAccountByIdParamsType,
  GetUserMoneyAccountByIdResType,
  GetUserMoneyAccountResType,
  UpdateUserMoneyAccountBodyType,
  UpdateUserMoneyAccountResType
} from '~/schemaValidations/money-accounts.schema'
import moneyAccountsService from '~/services/money-accounts.service'
import { TokenPayload } from '~/types/jwt.type'

export const createMoneyAccountController = async (
  req: Request<ParamsDictionary, any, CreateMoneyAccountBodyType>,
  res: Response<CreateMoneyAccountResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await moneyAccountsService.createMoneyAccount(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_MONEY_ACCOUNT_SUCCESS })
}

export const getUserMoneyAccountController = async (
  req: Request,
  res: Response<GetUserMoneyAccountResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await moneyAccountsService.getUserMoneyAccount(user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_MONEY_ACCOUNT_SUCCESS, data: result })
}

export const getUserMoneyAccountByIdController = async (
  req: Request<GetUserMoneyAccountByIdParamsType>,
  res: Response<GetUserMoneyAccountByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await moneyAccountsService.getUserMoneyAccountById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_MONEY_ACCOUNT_BY_ID_SUCCESS, data: result })
}

export const deleteUserMoneyAccountByIdController = async (
  req: Request<GetUserMoneyAccountByIdParamsType>,
  res: Response<DeleteUserMoneyAccountByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await moneyAccountsService.deleteUserMoneyAccountById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.DELETE_USER_MONEY_ACCOUNT_BY_ID_SUCCESS })
}

export const updateUserMoneyAccountController = async (
  req: Request<ParamsDictionary, any, UpdateUserMoneyAccountBodyType>,
  res: Response<UpdateUserMoneyAccountResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await moneyAccountsService.updateUserMoneyAccount(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.UPDATE_USER_MONEY_ACCOUNT_SUCCESS })
}
