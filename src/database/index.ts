import { PrismaClient } from '@prisma/client'
import envConfig from '~/configs'

const prisma = new PrismaClient({
  datasourceUrl: envConfig.DATABASE_URL
})

export default prisma
