import prisma from '~/database'
import { CreateMoneyAccountTypeBodyType, CreateTransactionTypeBodyType } from '~/schemaValidations/admins.schema'

class AdminsService {
  async createTransactionType(body: CreateTransactionTypeBodyType) {
    const { icon, name, type } = body
    await prisma.transaction_types.create({
      data: { icon, name, type }
    })
    return true
  }

  async createMoneyAccountType(body: CreateMoneyAccountTypeBodyType) {
    const { icon, name } = body
    await prisma.money_account_types.create({
      data: { icon, name }
    })
    return true
  }

  async getAllMoneyAccountType() {
    const result = await prisma.money_account_types.findMany({
      select: {
        id: true,
        icon: true,
        name: true
      }
    })
    return result
  }
}

const adminsService = new AdminsService()
export default adminsService
