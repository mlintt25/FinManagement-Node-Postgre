import prisma from '~/database'
import { CreateTransactionTypeBodyType } from '~/schemaValidations/admins.schema'

class AdminsService {
  async createTransactionType(body: CreateTransactionTypeBodyType) {
    const { icon, name, type } = body
    await prisma.transaction_types.create({
      data: { icon, name, type }
    })
    return true
  }
}

const adminsService = new AdminsService()
export default adminsService
