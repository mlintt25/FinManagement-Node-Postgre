import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { envConfig } from './constants/configs'

const app = express()
const port = envConfig.port
app.use(express.json())
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
