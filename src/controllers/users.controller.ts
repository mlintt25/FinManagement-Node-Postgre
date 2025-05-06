import { Request, Response, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import usersService from '~/services/users.service'
import { TokenPayload } from '~/types/jwt.type'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordBodyType,
  ChangePasswordResType,
  CreateUserPersonalizationBodyType,
  CreateUserPersonalizationResType
} from '~/schemaValidations/users.schema'

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordBodyType>,
  res: Response<ChangePasswordResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await usersService.changePassword(user_id, req.body)
  return res.json({ message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS })
}

export const createUserPersonalizationController = async (
  req: Request<ParamsDictionary, any, CreateUserPersonalizationBodyType>,
  res: Response<CreateUserPersonalizationResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await usersService.createUserPersonalization(user_id, req.body)
  return res.json({ message: USERS_MESSAGES.ADD_USER_PERSONALIZATION_SUCCESS })
}
