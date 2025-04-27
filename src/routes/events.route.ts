import { Router } from 'express'
import {
  createEventController,
  deleteEventByIdController,
  getAllEventController,
  getEventByIdController,
  updateEventController
} from '~/controllers/events.controller'
import { accessTokenValidator } from '~/middlewares/auth.middleware'
import { createEventValidator, getEventByIdValidator, updateEventValidator } from '~/middlewares/events.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const eventsRouter = Router()
/**
 * @description Get all user's event.
 * @path /api/events/event
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @returns {Object} Response object with message and data.
 */
eventsRouter.get('/event', accessTokenValidator, wrapRequestHandler(getAllEventController))
/**
 * @description Get user's event by id.
 * @path /api/events/event/:id
 * @method GET
 * @header { Authorization: Bearer <access_token> }
 * @params { id: string }
 * @returns {Object} Response object with message and data.
 */
eventsRouter.get('/event/:id', accessTokenValidator, getEventByIdValidator, wrapRequestHandler(getEventByIdController))
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
/**
 * @description Delete event by id.
 * @path /api/events/event/:id
 * @method DELETE
 * @header { Authorization: Bearer <access_token> }
 * @params { id: string }
 * @returns {Object} Response object with message.
 */
eventsRouter.delete(
  '/event/:id',
  accessTokenValidator,
  getEventByIdValidator,
  wrapRequestHandler(deleteEventByIdController)
)

export default eventsRouter
