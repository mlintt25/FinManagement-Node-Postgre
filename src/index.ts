import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { envConfig } from './configs'
import { createServer } from 'http'
import cors from 'cors'
import prisma from './database'

const port = envConfig.port
const app = express()
const httpServer = createServer(app)

app.use(cors())
app.use(express.json())
app.use(defaultErrorHandler)

const startServer = async () => {
  // Check connect to the database
  try {
    await prisma.$connect()
    console.log('Connected to the database')
  } catch (error) {
    console.error('Failed to connect to the database', error)
    process.exit(1)
  }
  // Start the server
  httpServer.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
  })
}

startServer()
