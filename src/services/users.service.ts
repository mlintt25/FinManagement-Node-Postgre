import { Decimal } from '@prisma/client/runtime/library'
import prisma from '~/database'
import {
  ChangePasswordBodyType,
  CreateUserPersonalizationBodyType,
  UpdateUserPersonalizationBodyType
} from '~/schemaValidations/users.schema'
import { hashPassword } from '~/utils/hash'

class UsersService {
  async getMe(user_id: string) {
    const result = await prisma.users.findUniqueOrThrow({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        verify: true,
        role: true,
        avatar: true
      }
    })
    return result
  }

  async changePassword(user_id: string, body: ChangePasswordBodyType) {
    const { newPassword } = body
    const hashedPassword = await hashPassword(newPassword)

    await prisma.users.update({
      where: { id: user_id },
      data: { password: hashedPassword }
    })

    return true
  }

  async getUserPersonalization(user_id: string) {
    const userPersonalization = await prisma.user_personalizations.findFirstOrThrow({
      where: { user_id },
      select: {
        id: true,
        occupation: true,
        monthly_income: true,
        financial_goals: true
      }
    })
    return userPersonalization
  }

  async getUserPersonalizationStatus(user_id: string) {
    const userPersonalization = await prisma.user_personalizations.findFirst({
      where: { user_id },
      select: {
        id: true,
        occupation: true,
        monthly_income: true,
        financial_goals: true
      }
    })

    if (!userPersonalization) {
      return false
    }

    return true
  }

  async getUserPersonalizationToChatbot(user_id: string) {
    const userMonthlyIncome = await prisma.user_personalizations.findFirst({
      where: { user_id },
      select: { monthly_income: true }
    })
    // Get start and end of month
    const now = new Date()
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))

    const totalAmountExpenseOfMonth = await prisma.transactions.aggregate({
      where: {
        user_id,
        occur_date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        transaction_type_category: {
          transaction_type: {
            type: 'Expense'
          }
        }
      },
      _sum: {
        amount_of_money: true
      }
    })

    const expenseTransactionsOfMonth = await prisma.transactions.findMany({
      where: {
        user_id,
        occur_date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        transaction_type_category: {
          transaction_type: {
            type: 'Expense'
          }
        }
      },
      select: {
        amount_of_money: true,
        transaction_type_category: {
          select: {
            name: true
          }
        }
      }
    })

    return {
      monthly_income: userMonthlyIncome!.monthly_income,
      total_amount_expense_of_month: totalAmountExpenseOfMonth._sum.amount_of_money ?? new Decimal(0),
      expense_transactions_of_month: expenseTransactionsOfMonth.map((transaction) => ({
        amount_of_money: transaction.amount_of_money,
        name: transaction.transaction_type_category.name
      }))
    }
  }

  async createUserPersonalization(user_id: string, body: CreateUserPersonalizationBodyType) {
    await prisma.user_personalizations.create({
      data: {
        user_id,
        ...body
      }
    })
    return true
  }

  async updateUserPersonalization(user_id: string, body: UpdateUserPersonalizationBodyType) {
    await prisma.user_personalizations.update({
      where: { id: body.id, user_id },
      data: body
    })
    return true
  }
}

const usersService = new UsersService()
export default usersService
