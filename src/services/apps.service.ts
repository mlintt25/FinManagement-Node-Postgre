import { TransactionType } from '~/constants/enums'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBodyType } from '~/schemaValidations/admins.schema'
import { TransactionTypeCategoryType } from '~/schemaValidations/apps.schema'

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
}

const appsService = new AppsService()
export default appsService
