import { config } from 'dotenv'

config()
export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  databaseURL: process.env.DATABASE_URL as string,
  passwordSecret: process.env.PASSWORD_SECRET as string,
  JWTSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWTSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWTSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  JWTSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string
}
