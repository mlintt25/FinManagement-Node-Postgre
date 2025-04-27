import { Router } from 'express'
import { createEventController } from '~/controllers/events.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { createEventValidator } from '~/middlewares/events.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const eventsRouter = Router()
/**
 * @description Create new event.
 * @path /api/events/event
 * @method POST
 * @header { Authorization: Bearer <access_token> }
 * @body { icon: string, name: string, end_date: date, money_accounts: string[] }
 * @returns {Object} Response object with message.
 */
eventsRouter.post('/event', accessTokenValidator, createEventValidator, wrapRequestHandler(createEventController))

export default eventsRouter
