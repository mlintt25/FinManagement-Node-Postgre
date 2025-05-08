import { NextFunction, Request, Response } from 'express'
import envConfig from '~/configs'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { EmailVerifyTokenBody, LoginBody, RefreshTokenBody, RegisterBody } from '~/schemaValidations/auth.schema'
import { TokenPayload } from '~/types/jwt.type'
import { AuthError, EntityError, ErrorWithStatus, ForbiddenError } from '~/utils/errors'
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

export const refreshTokenValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = RefreshTokenBody.parse(req.body)
    const { refreshToken } = validatedData

    const [decodedRefreshToken, userRefreshToken] = await Promise.all([
      // 1. Decode refresh token
      verifyToken({
        token: refreshToken,
        secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN
      }),
      // 2. Query refresh token of user from database
      prisma.refresh_tokens.findFirst({ where: { token: refreshToken } })
    ])

    if (!userRefreshToken) {
      throw new AuthError(USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST)
    }
    ;(req as Request).decodedRefreshToken = decodedRefreshToken

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

export const emailVerifyTokenValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = EmailVerifyTokenBody.parse(req.body)
    const { email_verify_token } = validatedData

    const decoded_email_verify_token = await verifyToken({
      token: email_verify_token,
      secretOrPublicKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN
    })

    const { user_id } = decoded_email_verify_token
    const user = await prisma.users.findUnique({
      where: {
        id: user_id
      }
    })
    if (!user) {
      throw new EntityError([{ message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_INVALID, field: 'email_verify_token' }])
    }
    if (!user.email_verify_token) {
      return res.status(HTTP_STATUS.OK).json({
        message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
      })
    }
    ;(req as Request).decodedEmailVerifyToken = decoded_email_verify_token

    next()
  } catch (error) {
    next(error)
  }
}

export const unverifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { verify } = req.decodedAccessToken as TokenPayload

    if (verify === UserVerifyStatus.Verified) {
      return res.status(HTTP_STATUS.OK).json({
        message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
      })
    }

    next()
  } catch (error) {
    next(error)
  }
}
