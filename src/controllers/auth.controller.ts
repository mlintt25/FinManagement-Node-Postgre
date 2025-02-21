import { Request, Response, NextFunction } from 'express'
import { UserVerifyStatus } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserType } from '~/schemaValidations/users.schema'
import authService from '~/services/auth.service'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  LogoutResType,
  RefreshTokenBodyType,
  RefreshTokenResType,
  RegisterBodyType,
  RegisterResType
} from '~/schemaValidations/auth.schema'
import { TokenPayload } from '~/types/jwt.type'

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
  await authService.register(req.body)
  return res.json({ message: USERS_MESSAGES.REGISTER_SUCCESS })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutBodyType>,
  res: Response<LogoutResType>,
  next: NextFunction
) => {
  await authService.logout(req.body)
  return res.json({ message: USERS_MESSAGES.LOGOUT_SUCCESS })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenBodyType>,
  res: Response<RefreshTokenResType>,
  next: NextFunction
) => {
  const { refreshToken } = req.body
  const { user_id, exp, verify } = req.decodedRefreshToken as TokenPayload
  const result = await authService.refreshToken({ oldRefreshToken: refreshToken, user_id, verify, exp })
  return res.json({ message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS, data: result })
}
