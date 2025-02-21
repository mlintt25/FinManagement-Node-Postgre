import { Request, Response, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import usersService from '~/services/users.service'
import { TokenPayload } from '~/types/jwt.type'

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await usersService.changePassword(user_id, req.body)
  return res.json({ message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS })
}
