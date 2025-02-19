import { Request, Response, NextFunction } from 'express'
import { UserVerifyStatus } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserType } from '~/schemaValidations/users.schema'
import authService from '~/services/auth.service'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginBodyType, LoginResType, RegisterBodyType, RegisterResType } from '~/schemaValidations/auth.schema'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginBodyType>,
  res: Response<LoginResType>,
  next: NextFunction
) => {
  const user = req.user as UserType
  const result = await authService.login({ user_id: user.id, verify: user.verify as UserVerifyStatus })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data: {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      user: user
    }
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterBodyType>,
  res: Response<RegisterResType>,
  next: NextFunction
) => {
  const result = await authService.register(req.body)
  return res.json({ message: result })
}
