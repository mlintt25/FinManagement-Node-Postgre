import prisma from '~/database'
import { CreateEventBodyType, GetEventByIdParamsType, UpdateEventBodyType } from '~/schemaValidations/events.schema'

class EventsService {
  async getAllEvent(user_id: string) {
    const events = await prisma.events.findMany({
      where: {
        user_id
      },
      select: {
        id: true,
        icon: true,
        name: true,
        end_date: true,
        money_accounts: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    return events
  }

  async getEventById(user_id: string, params: GetEventByIdParamsType) {
    const event = await prisma.events.findFirstOrThrow({
      where: {
        id: params.id,
        user_id
      },
      select: {
        id: true,
        icon: true,
        name: true,
        end_date: true,
        money_accounts: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    return event
  }

  async createEvent(user_id: string, body: CreateEventBodyType) {
    const { icon, name, end_date, money_accounts } = body
    await prisma.events.create({
      data: {
        icon,
        name,
        end_date,
        user_id,
        money_accounts: {
          connect: money_accounts.map((id) => ({ id }))
        }
      }
    })
    return true
  }

  async updateEventById(user_id: string, body: UpdateEventBodyType) {
    const { id, icon, name, end_date, money_accounts } = body
    await prisma.events.update({
      data: {
        icon,
        name,
        end_date,
        user_id,
        money_accounts: {
          set: money_accounts.map((id) => ({ id }))
        }
      },
      where: {
        id,
        user_id
      }
    })
    return true
  }

  async deleteEventById(user_id: string, params: GetEventByIdParamsType) {
    await prisma.events.delete({
      where: {
        id: params.id,
        user_id
      }
    })
    return true
  }
}

const eventsService = new EventsService()
export default eventsService
