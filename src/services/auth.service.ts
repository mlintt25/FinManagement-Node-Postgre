import envConfig from '~/configs'
import { Role, TokenType, UserVerifyStatus } from '~/constants/enums'
import prisma from '~/database'
import { LogoutBodyType, RegisterBodyType } from '~/schemaValidations/auth.schema'
import { OAuthTokenPayload } from '~/types/jwt.type'
import { sendVerifyEmail, sendWelcomeEmail } from '~/utils/email'
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

  async signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN
    })
  }

  async loginWithGoogle(payload: OAuthTokenPayload) {
    const { email, picture } = payload
    let user = await prisma.users.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        verify: true,
        role: true,
        avatar: true
      }
    })
    if (!user) {
      const password = Math.random().toString(36).slice(-10) // tạo mật khẩu ngắn gọn hơn
      await this.register({
        email,
        password,
        confirmPassword: password
      })
      user = await prisma.users.update({
        where: { email },
        data: {
          verify: UserVerifyStatus.Verified,
          avatar: picture
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
    }
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user!.id,
      verify: user!.verify as UserVerifyStatus
    })
    const { exp } = await this.decodeRefreshToken(refresh_token)
    await prisma.refresh_tokens.create({
      data: {
        user_id: user!.id,
        token: refresh_token,
        expires_at: new Date(exp * 1000)
      }
    })
    return {
      access_token,
      refresh_token,
      user
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // Sign access and refresh token
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
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

  async refreshToken({
    oldRefreshToken,
    user_id,
    verify,
    exp
  }: {
    oldRefreshToken: string
    user_id: string
    verify: UserVerifyStatus
    exp: number
  }) {
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp })
    ])
    const decodedRefreshToken = await this.decodeRefreshToken(newRefreshToken)
    /**
     * Executes a database transaction to refresh the user's token.
     *
     * Transaction ensures atomicity ("all or nothing"):
     * - If all queries succeed, changes are committed to the database.
     * - If any query fails, the entire transaction is rolled back, restoring the original state.
     *
     * This guarantees:
     * 1. Data integrity: Prevents invalid or partial data updates.
     * 2. Race condition prevention: Ensures consistency during concurrent requests.
     */
    await prisma.$transaction([
      prisma.refresh_tokens.delete({ where: { token: oldRefreshToken } }),
      prisma.refresh_tokens.create({
        data: {
          user_id,
          token: newRefreshToken,
          expires_at: new Date(decodedRefreshToken.exp * 1000)
        }
      })
    ])

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async sendVerifyEmail(user_id: string) {
    const emailVerifyToken = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    const user = await prisma.users.update({
      where: { id: user_id },
      data: { email_verify_token: emailVerifyToken },
      select: {
        name: true,
        email: true
      }
    })
    await sendVerifyEmail(user.email, {
      name: user.name,
      verifyLink: `${envConfig.CLIENT_URL}/verify-email?token=${emailVerifyToken}`
    })
    return true
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      prisma.users.update({
        where: { id: user_id },
        data: {
          verify: UserVerifyStatus.Verified,
          email_verify_token: null
        }
      })
    ])
    const [, refresh_token] = token
    const { exp } = await this.decodeRefreshToken(refresh_token)
    await prisma.$transaction([
      prisma.refresh_tokens.deleteMany({
        where: { user_id }
      }),
      prisma.refresh_tokens.create({
        data: {
          user_id,
          token: refresh_token,
          expires_at: new Date(exp * 1000)
        }
      })
    ])
    return true
  }
}

const authService = new AuthService()
export default authService
