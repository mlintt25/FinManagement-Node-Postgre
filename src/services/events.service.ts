import prisma from '~/database'
import { CreateEventBodyType } from '~/schemaValidations/events.schema'

class EventsService {
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
}

const eventsService = new EventsService()
export default eventsService
