import prisma from '~/database'
import { CreateTransactionTypeBodyType } from '~/schemaValidations/admins.schema'

class AdminsService {
  async createTransactionType(body: CreateTransactionTypeBodyType) {
    const { icon, name } = body
    await prisma.transaction_types.create({
      data: { icon, name }
    })
    return true
  }
}

const adminsService = new AdminsService()
export default adminsService
