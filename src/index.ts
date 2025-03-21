import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import { createServer } from 'http'
import cors from 'cors'
import prisma from './database'
import authRouter from './routes/auth.route'
import { isPrismaClientInitializationError } from './utils/errors'
import envConfig from './configs'
import usersRouter from './routes/users.route'

const prefix = '/api'
const port = envConfig.PORT
const app = express()
const httpServer = createServer(app)

app.use(cors())
app.use(express.json())
app.use(`${prefix}/auth`, authRouter)
app.use(`${prefix}/users`, usersRouter)
app.use(defaultErrorHandler)

const startServer = async () => {
  // Check connect to the database
  try {
    await prisma.$connect()
    console.log('Connected to the database')
  } catch (error) {
    if (isPrismaClientInitializationError(error) && error.errorCode === 'P1000') {
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
