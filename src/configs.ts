import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import z from 'zod'

config({
  path: '.env'
})

const checkEnv = async () => {
  const chalk = (await import('chalk')).default
  if (!fs.existsSync(path.resolve('.env'))) {
    console.log(chalk.blue(`Cannot find .env environment file`))
    process.exit(1)
  }
}

checkEnv()

export const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  JWT_SECRET_ACCESS_TOKEN: z.string(),
  JWT_SECRET_REFRESH_TOKEN: z.string(),
  JWT_SECRET_EMAIL_VERIFY_TOKEN: z.string(),
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: z.string(),
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: z.string(),
  EMAIL_TEMPLATE_PATH: z
    .string()
    .transform((val) => (val.trim() === '' ? 'src/templates' : val)) // Handle empty string case
    .default('src/templates'),
  EMAIL_USER: z.string(),
  EMAIL_APP_PASSWORD: z.string()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error(configServer.error.issues)
  throw new Error('The declared values ​in the .env file are invalid.')
}

const envConfig = configServer.data
export default envConfig
