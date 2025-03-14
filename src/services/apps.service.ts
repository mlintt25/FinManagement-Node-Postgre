import { money_accounts, transaction_type_categories } from '@prisma/client'
import { TransactionType } from '~/constants/enums'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBodyType } from '~/schemaValidations/admins.schema'
import {
  CreateMoneyAccountBodyType,
  CreateTransactionBodyType,
  TransactionTypeCategoryType
} from '~/schemaValidations/apps.schema'

class AppsService {
  async getAllTransactionTypeCategory(user_id: string) {
    const transactionTypeCategories = await prisma.transaction_type_categories.findMany({
      // user_id = null is default category
      // user_id = user_id is user created category
      where: {
        OR: [{ user_id: user_id }, { user_id: null }]
      },
      select: {
        id: true,
        transaction_type_id: true,
        icon: true,
        name: true,
        parent_id: true,
        transaction_type: {
          select: {
            type: true
          }
        }
      }
    })

    const categoryMap = new Map<string, any>()
    const finalExpenseCategories: TransactionTypeCategoryType[] = []
    const expenseCategories: Omit<TransactionTypeCategoryType, 'children'>[] = []
    const incomeCategories: Omit<TransactionTypeCategoryType, 'children'>[] = []
    // I don't want to show transaction_type in the response
    // So, I'm destructuring it and using it separately
    transactionTypeCategories.forEach(({ transaction_type, ...category }) => {
      if (transaction_type.type === TransactionType.Expense) {
        expenseCategories.push(category)
      } else {
        incomeCategories.push(category)
      }
    })

    expenseCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    expenseCategories.forEach((category) => {
      if (category.parent_id === null) {
        finalExpenseCategories.push(categoryMap.get(category.id))
      } else {
        categoryMap.get(category.parent_id as string)?.children.push(categoryMap.get(category.id))
      }
    })

    return { expense: finalExpenseCategories, income: incomeCategories }
  }

  async createTransactionTypeCategory(user_id: string, body: CreateTransactionTypeCategoryBodyType) {
    const { transaction_type_id, icon, name, parent_id } = body
    await prisma.transaction_type_categories.create({
      data: { transaction_type_id, icon, name, parent_id, user_id }
    })
    return true
  }

  async createTransaction(user_id: string, body: CreateTransactionBodyType) {
    // Using $transaction to make sure that both the transactions and money_accounts are updated
    await prisma.$transaction(async (tx) => {
      // Create transaction
      await tx.transactions.create({
        data: { ...body, user_id }
      })
      // Check type of transaction type category (Expense or Income)
      const transactionTypeCategory = (await tx.transaction_type_categories.findUnique({
        where: { id: body.transaction_type_category_id },
        select: {
          transaction_type: {
            select: {
              type: true
            }
          }
        }
      })) as { transaction_type: { type: TransactionType } }
      // Expense: Decrement
      // Income: Increment
      await tx.money_accounts.update({
        where: { id: body.money_account_id },
        data: {
          account_balance:
            transactionTypeCategory.transaction_type.type === TransactionType.Expense
              ? { decrement: body.amount_of_money }
              : { increment: body.amount_of_money }
        }
      })
    })
    return true
  }

  async createMoneyAccount(user_id: string, body: CreateMoneyAccountBodyType) {
    const { reminder_time, payment_due_date, ...money_account_body } = body
    await prisma.$transaction(async (tx) => {
      const newMoneyAccount = await tx.money_accounts.create({
        data: { ...money_account_body, user_id }
      })
      if (!reminder_time || !payment_due_date) return
      await tx.credit_card_reminders.createMany({
        data: (reminder_time as string[]).map((time) => ({
          money_account_id: newMoneyAccount.id,
          reminder_time: time,
          payment_due_date: payment_due_date as number
        }))
      })
    })
    return true
  }

  async getUserMoneyAccount(user_id: string) {
    const result = await prisma.money_accounts.findMany({
      where: { user_id },
      select: {
        id: true,
        name: true,
        account_balance: true,
        money_account_type: {
          select: {
            icon: true
          }
        }
      }
    })
    return result
  }
}

const appsService = new AppsService()
export default appsService
