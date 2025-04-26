import prisma from '~/database'
import {
  CreateBudgetBodyType,
  GetUserBudgetByIdParamsType,
  UpdateUserBudgetBodyType
} from '~/schemaValidations/budgets.schema'

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

  async getUserBudget(user_id: string) {
    const budgets = await prisma.budgets.findMany({
      where: { user_id },
      select: {
        id: true,
        name: true,
        amount_of_money: true,
        start_date: true,
        end_date: true,
        money_accounts: {
          select: { id: true, name: true }
        },
        transaction_type_categories: {
          select: { id: true, name: true, icon: true, parent_id: true }
        }
      }
    })

    const now = new Date()

    const budgetsWithStats = await Promise.all(
      budgets.map(async (budget) => {
        const categoryIds = budget.transaction_type_categories.map((cat) => cat.id)
        const startDate = budget.start_date
        const endDate = budget.end_date

        const [totalExpensesResult, transactionsInBudget] = await Promise.all([
          prisma.transactions.aggregate({
            where: {
              user_id,
              transaction_type_category_id: { in: categoryIds },
              occur_date: { gte: startDate, lte: endDate }
            },
            _sum: { amount_of_money: true }
          }),
          prisma.transactions.findMany({
            where: {
              user_id,
              transaction_type_category_id: { in: categoryIds },
              occur_date: { gte: startDate, lte: endDate }
            },
            select: {
              id: true,
              amount_of_money: true,
              occur_date: true,
              transaction_type_category: { select: { id: true, name: true, icon: true } },
              money_account: { select: { id: true, name: true } }
            }
          })
        ])

        const totalExpenses = Number(totalExpensesResult._sum.amount_of_money || 0)
        const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        const remainingDays = Math.max((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24), 0)

        const actualExpensesPerDay = totalDays > 0 ? totalExpenses / totalDays : 0
        const remainingBudgetAmount = Number(budget.amount_of_money) - totalExpenses
        const shouldExpensesPerDay = remainingDays > 0 ? remainingBudgetAmount / remainingDays : 0
        const expectedTotalExpenses = actualExpensesPerDay * remainingDays + totalExpenses

        return {
          budget: {
            ...budget,
            transactions: transactionsInBudget
          },
          total_expenses: totalExpenses,
          remaining_budget_amount: remainingBudgetAmount,
          actual_expenses: actualExpensesPerDay,
          should_expenses: shouldExpensesPerDay,
          expected_expenses: expectedTotalExpenses
        }
      })
    )

    return budgetsWithStats
  }

  async getUserBudgetById(body: GetUserBudgetByIdParamsType, user_id: string) {
    /**
     * Logic:
     * 1. Get budget by id and user_id
     * 2. Get all transactions in the budget period (start_date to end_date) and categories
     * 3. Calculate:
     *  - total_expenses: sum of all transactions in the budget period and categories
     *  - remaining_budget_amount: budget amount - total_expenses
     *  - actual_expenses: total_expenses / total_days
     *  - should_expenses: remaining_budget_amount / remaining_days
     *  - expected_expenses: actual_expenses * remaining_days + total_expenses
     */
    /**
     * Convert data to format:
     * {
     *  budget: {},
     *  total_expenses: ...,
     *  remaining_budget_amount: ...,
     *  actual_expenses: ...,
     *  should_expenses: ...,
     *  expected_expenses: ...
     * }
     */
    const budget = await prisma.budgets.findFirstOrThrow({
      where: { id: body.id, user_id },
      select: {
        id: true,
        name: true,
        amount_of_money: true,
        start_date: true,
        end_date: true,
        money_accounts: {
          select: { id: true, name: true }
        },
        transaction_type_categories: {
          select: { id: true, name: true, icon: true, parent_id: true }
        }
      }
    })

    const categoryIds = budget.transaction_type_categories.map((cat) => cat.id)
    const startDate = budget.start_date
    const endDate = budget.end_date
    const now = new Date()

    const [totalExpensesResult, transactionsInBudget] = await Promise.all([
      prisma.transactions.aggregate({
        where: {
          user_id,
          transaction_type_category_id: { in: categoryIds },
          occur_date: { gte: startDate, lte: endDate }
        },
        _sum: { amount_of_money: true }
      }),
      prisma.transactions.findMany({
        where: {
          user_id,
          transaction_type_category_id: { in: categoryIds },
          occur_date: { gte: startDate, lte: endDate }
        },
        select: {
          id: true,
          amount_of_money: true,
          occur_date: true,
          transaction_type_category: { select: { id: true, name: true, icon: true } },
          money_account: { select: { id: true, name: true } }
        }
      })
    ])

    const totalExpenses = Number(totalExpensesResult._sum.amount_of_money || 0)
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const remainingDays = Math.max((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24), 0)

    const actualExpensesPerDay = totalDays > 0 ? totalExpenses / totalDays : 0
    const remainingBudgetAmount = Number(budget.amount_of_money) - totalExpenses
    const shouldExpensesPerDay = remainingDays > 0 ? remainingBudgetAmount / remainingDays : 0
    const expectedTotalExpenses = actualExpensesPerDay * remainingDays + totalExpenses

    return {
      budget: { ...budget, transactions: transactionsInBudget },
      total_expenses: totalExpenses,
      remaining_budget_amount: remainingBudgetAmount,
      actual_expenses: actualExpensesPerDay,
      should_expenses: shouldExpensesPerDay,
      expected_expenses: expectedTotalExpenses
    }
  }

  async deleteUserBudgetById(body: GetUserBudgetByIdParamsType, user_id: string) {
    await prisma.budgets.delete({
      where: { id: body.id, user_id }
    })
    return true
  }

  async updateUserBudget(user_id: string, body: UpdateUserBudgetBodyType) {
    await prisma.budgets.update({
      data: {
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
      },
      where: {
        id: body.id,
        user_id
      }
    })
    return true
  }
}

const budgetsService = new BudgetsService()
export default budgetsService
