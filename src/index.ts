import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import { createServer } from 'http'
import cors from 'cors'
import prisma from './database'
import authRouter from './routes/auth.route'
import { isPrismaClientInitializationError } from './utils/errors'
import envConfig from './configs'
import usersRouter from './routes/users.route'
import { PrismaErrorCode } from './constants/prisma-error'
import adminsRouter from './routes/admins.route'
import transactionsRouter from './routes/transactions.route'
import moneyAccountsRouter from './routes/money-accounts.route'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Finance Management API - OpenAPI 3.0',
      version: '1.0.0',
      description:
        'This is a Personal Finance Management API designed based on the OpenAPI 3.0 specification.\n' +
        'This API helps users efficiently track their income, expenses, and overall financial health.\n\n' +
        'With a **design-first approach**, we aim to continuously improve the API by refining its structure\n' +
        'and adding new features over time. Your contributions, whether through feedback or code enhancements,\n' +
        'are always welcome!\n\n' +
        'Some useful links:\n' +
        '- [Project Repository](https://github.com/mlintt25/FinManagement-Node-Postgre)\n' +
        '- [API Documentation Source](#)',
      termsOfService: 'http://swagger.io/terms/',
      contact: {
        email: 'apiteam@swagger.io'
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Local development server'
      }
    ],
    externalDocs: {
      description: 'Find out more about Swagger',
      url: 'http://swagger.io'
    }
  },
  apis: ['./openapi/*.yaml']
}

const openapiSpecification = swaggerJsdoc(options)

const prefix = '/api'
const port = envConfig.PORT
const app = express()
const httpServer = createServer(app)

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use(`${prefix}/auth`, authRouter)
app.use(`${prefix}/users`, usersRouter)
app.use(`${prefix}/admins`, adminsRouter)
app.use(`${prefix}/transactions`, transactionsRouter)
app.use(`${prefix}/money-accounts`, moneyAccountsRouter)
app.use(defaultErrorHandler)

const startServer = async () => {
  // Check connect to the database
  try {
    await prisma.$connect()
    console.log('Connected to the database')
  } catch (error) {
    if (isPrismaClientInitializationError(error) && error.errorCode === PrismaErrorCode.AuthenticationFailed) {
      console.error('Could not connect to the database. Please check the DATABASE_URL')
      process.exit(1)
    }
  }
  // Start the server
  httpServer.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
  })
}

startServer()
