import { Request, Response, NextFunction } from 'express'
import { APPS_MESSAGES } from '~/constants/messages'
import prisma from '~/database'
import { CreateEventBody, GetEventByIdParams, UpdateEventBody } from '~/schemaValidations/events.schema'
import { TokenPayload } from '~/types/jwt.type'
import { EntityError } from '~/utils/errors'

export const createEventValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CreateEventBody.parse(req.body)
    const { name, money_accounts } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload

    const [countMoneyAccounts, eventExist] = await Promise.all([
      prisma.money_accounts.count({
        where: {
          id: {
            in: money_accounts
          },
          user_id
        }
      }),
      prisma.events.findFirst({
        where: {
          name,
          user_id
        }
      })
    ])

    if (countMoneyAccounts !== money_accounts.length) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_MONEY_ACCOUNT_ID, field: 'money_accounts' }])
    }

    if (eventExist) {
      throw new EntityError([{ message: APPS_MESSAGES.EVENT_NAME_EXIST, field: 'name' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const updateEventValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdateEventBody.parse(req.body)
    const { id, name, money_accounts } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload

    const [event, countMoneyAccounts, eventExist] = await Promise.all([
      prisma.events.findFirst({
        where: {
          id,
          user_id
        }
      }),
      prisma.money_accounts.count({
        where: {
          id: {
            in: money_accounts
          },
          user_id
        }
      }),
      prisma.events.findFirst({
        where: {
          name,
          user_id
        }
      })
    ])

    if (!event) {
      throw new EntityError([{ message: APPS_MESSAGES.EVENT_NOT_FOUND, field: 'id' }])
    }

    if (countMoneyAccounts !== money_accounts.length) {
      throw new EntityError([{ message: APPS_MESSAGES.INVALID_MONEY_ACCOUNT_ID, field: 'money_accounts' }])
    }

    if (event.name !== name) {
      if (eventExist) {
        throw new EntityError([{ message: APPS_MESSAGES.EVENT_NAME_EXIST, field: 'name' }])
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const getEventByIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = GetEventByIdParams.parse(req.params)
    const { id } = validatedData
    const { user_id } = req.decodedAccessToken as TokenPayload

    const event = await prisma.events.findFirst({
      where: {
        id,
        user_id
      }
    })

    if (!event) {
      throw new EntityError([{ message: APPS_MESSAGES.EVENT_NOT_FOUND, field: 'id' }])
    }

    next()
  } catch (error) {
    next(error)
  }
}
