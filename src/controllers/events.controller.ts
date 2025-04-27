import { Request, Response, NextFunction } from 'express'
import { APPS_MESSAGES } from '~/constants/messages'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateEventBodyType, CreateEventResType } from '~/schemaValidations/events.schema'
import { TokenPayload } from '~/types/jwt.type'
import eventsService from '~/services/events.service'

export const createEventController = async (
  req: Request<ParamsDictionary, any, CreateEventBodyType>,
  res: Response<CreateEventResType>,
  next: NextFunction
) => {
  const { user_id } = req.decodedAccessToken as TokenPayload
  await eventsService.createEvent(user_id, req.body)
  return res.json({ message: APPS_MESSAGES.ADD_EVENT_SUCCESS })
}
