import { Router } from 'express'
import { createEventController, updateEventController } from '~/controllers/events.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { createEventValidator, updateEventValidator } from '~/middlewares/events.middleware'
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
/**
 * @description Update event by id.
 * @path /api/events/event
 * @method PATCH
 * @header { Authorization: Bearer <access_token> }
 * @body { id: string, icon: string, name: string, end_date: date, money_accounts: string[] }
 * @returns {Object} Response object with message.
 */
eventsRouter.patch('/event', accessTokenValidator, updateEventValidator, wrapRequestHandler(updateEventController))
export default eventsRouter
