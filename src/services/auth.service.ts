import { Role } from '@prisma/client'
import envConfig from '~/configs'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { LogoutBodyType, RegisterBodyType } from '~/schemaValidations/auth.schema'
import { sendWelcomeEmail } from '~/utils/email'
import { hashPassword } from '~/utils/hash'
import { signToken, verifyToken } from '~/utils/jwt'

class AuthService {
  async signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  async signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN
      })
    }
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN,
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        expiresIn: envConfig.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        expiresIn: envConfig.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  async signAccessAndRefeshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN
    })
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // Sign access and refresh token
    const [access_token, refresh_token] = await this.signAccessAndRefeshToken({ user_id, verify })
    const { exp } = await this.decodeRefreshToken(refresh_token)
    // Save refresh token to database
    await prisma.refresh_tokens.create({
      data: {
        user_id,
        token: refresh_token,
        expires_at: new Date(exp * 1000)
      }
    })
    return { access_token, refresh_token }
  }

  async register(body: RegisterBodyType) {
    // Get name from email (keindev@gmail.com -> keindev)
    const name = body.email.split('@')[0].toLowerCase()
    const hashedPassword = await hashPassword(body.password)
    await prisma.users.create({
      data: {
        name: name,
        email: body.email,
        password: hashedPassword,
        role: Role.User,
        verify: UserVerifyStatus.Unverified
      }
    })
    await sendWelcomeEmail(body.email, { name })
    return true
  }

  async logout(body: LogoutBodyType) {
    const { refreshToken } = body
    await prisma.refresh_tokens.delete({ where: { token: refreshToken } })
    return true
  }
}

const authService = new AuthService()
export default authService
