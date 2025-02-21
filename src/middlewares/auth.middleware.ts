import { NextFunction, Request, Response } from 'express'
import envConfig from '~/configs'
import { USERS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { LoginBody, RegisterBody } from '~/schemaValidations/auth.schema'
import { AuthError, EntityError, ForbiddenError } from '~/utils/errors'
import { verifyPassword } from '~/utils/hash'
import { verifyToken } from '~/utils/jwt'

export const accessTokenValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1]

    if (!accessToken) {
      throw new ForbiddenError(USERS_MESSAGES.UNAUTHORIZED)
    }

    const decodedAccessToken = await verifyToken({
      token: accessToken,
      secretOrPublicKey: envConfig.JWT_SECRET_ACCESS_TOKEN
    })

    ;(req as Request).decodedAccessToken = decodedAccessToken

    next()
  } catch (error) {
    next(error)
  }
}

export const loginValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = LoginBody.parse(req.body)
    const { email, password } = validatedData
    const user = await prisma.users.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        verify: true,
        role: true,
        avatar: true,
        password: true // Only select in login case
      }
    })
    const isEmailOrPasswordValid = user && (await verifyPassword(password, user.password))

    if (!isEmailOrPasswordValid) {
      throw new AuthError(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
    }
    // Remove password field from user object
    const { password: _, ...safeUser } = user
    ;(req as Request & { user: typeof safeUser }).user = safeUser

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
