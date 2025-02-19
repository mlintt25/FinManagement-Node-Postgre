import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { LoginBody, RegisterBody } from '~/schemaValidations/auth.schema'
import { AuthError, EntityError } from '~/utils/errors'
import { hashPassword } from '~/utils/hash'

export const loginValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = LoginBody.parse(req.body)
    const { email, password } = validatedData
    const user = await prisma.users.findUnique({
      where: {
        email,
        password: hashPassword(password)
      },
      select: {
        id: true,
        name: true,
        email: true,
        verify: true,
        role: true,
        avatar: true
      }
    })
    if (user === null) {
      throw new AuthError(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
    }
    ;(req as Request).user = user

    next()
  } catch (error) {
    next(error)
  }
}

export const registerValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = RegisterBody.parse(req.body)
    const { email } = validatedData
    const user = await prisma.users.findUnique({
      where: {
        email
      }
    })
    if (user !== null) {
      throw new EntityError([{ message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS, field: 'email' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}
