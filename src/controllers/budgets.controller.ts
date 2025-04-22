import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { APPS_MESSAGES } from '~/constants/messages'
import {
  CreateBudgetBodyType,
  CreateBudgetResType,
  GetUserBudgetByIdParamsType,
  GetUserBudgetByIdResType,
  GetUserBudgetResType
} from '~/schemaValidations/budgets.schema'
import budgetsService from '~/services/budgets.service'
import { TokenPayload } from '~/types/jwt.type'

export const createBudgetController = async (
  req: Request<ParamsDictionary, any, CreateBudgetBodyType>,
  res: Response<CreateBudgetResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await budgetsService.createBudget(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_BUDGET_SUCCESS })
}

export const getUserBudgetController = async (
  req: Request,
  res: Response<GetUserBudgetResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await budgetsService.getUserBudget(user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_BUDGET_SUCCESS, data: result })
}

export const getUserBudgetByIdController = async (
  req: Request<GetUserBudgetByIdParamsType>,
  res: Response<GetUserBudgetByIdResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  const result = await budgetsService.getUserBudgetById(req.params, user_id)
  return res.json({ message: APPS_MESSAGES.GET_USER_BUDGET_BY_ID_SUCCESS, data: result })
}
