import prisma from '~/database'
import { CreateBudgetBodyType } from '~/schemaValidations/budgets.schema'

class BudgetsService {
  async createBudget(user_id: string, body: CreateBudgetBodyType) {
    await prisma.budgets.create({
      data: {
        user_id,
        money_accounts: {
          connect: body.money_accounts.map((id) => ({ id }))
        },
        transaction_type_categories: {
          connect: body.transaction_type_categories.map((id) => ({ id }))
        },
        name: body.name,
        amount_of_money: body.amount_of_money,
        start_date: body.start_date,
        end_date: body.end_date
      }
    })
    return true
  }
}

const budgetsService = new BudgetsService()
export default budgetsService
