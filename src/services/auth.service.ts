import { Role } from '@prisma/client'
import { envConfig } from '~/configs'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { RegisterBodyType } from '~/schemaValidations/auth.schema'
import { hashPassword } from '~/utils/hash'
import { signToken, verifyToken } from '~/utils/jwt'

class AuthService {
  async signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: envConfig.JWTSecretAccessToken,
      options: {
        expiresIn: envConfig.accessTokenExpiresIn
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
        privateKey: envConfig.JWTSecretRefreshToken
      })
    }
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: envConfig.JWTSecretRefreshToken,
      options: {
        expiresIn: envConfig.refreshTokenExpiresIn
      }
    })
  }

  async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: envConfig.JWTSecretEmailVerifyToken,
      options: {
        expiresIn: envConfig.emailVerifyTokenExpiresIn
      }
    })
  }

  async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: envConfig.JWTSecretForgotPasswordToken,
      options: {
        expiresIn: envConfig.forgotPasswordTokenExpiresIn
      }
    })
  }

  async signAccessAndRefeshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.JWTSecretRefreshToken
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
    const name = body.email.split('@')[0]
    await prisma.users.create({
      data: {
        name: name,
        email: body.email,
        password: hashPassword(body.password),
        role: Role.User,
        verify: UserVerifyStatus.Unverified
      }
    })
    return USERS_MESSAGES.REGISTER_SUCCESS
  }
}

const authService = new AuthService()
export default authService
