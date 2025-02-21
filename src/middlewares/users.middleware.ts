import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { ChangePasswordBody } from '~/schemaValidations/users.schema'
import { TokenPayload } from '~/types/jwt.type'
import { ErrorWithStatus } from '~/utils/errors'
import { verifyPassword } from '~/utils/hash'

export const changePasswordValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = ChangePasswordBody.parse(req.body)
    const { oldPassword } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload

    const user = await prisma.users.findUnique({
      where: { id: user_id },
      select: { password: true }
    })

    if (!user || !(await verifyPassword(oldPassword, user.password))) {
      throw new ErrorWithStatus({
        message: user ? USERS_MESSAGES.OLD_PASSWORD_IS_INCORRECT : USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}
