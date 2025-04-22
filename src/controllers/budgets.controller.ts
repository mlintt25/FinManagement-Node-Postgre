import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { APPS_MESSAGES } from '~/constants/messages'
import { CreateBudgetBodyType, CreateBudgetResType } from '~/schemaValidations/budgets.schema'
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
