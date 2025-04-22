import { Decimal } from '@prisma/client/runtime/library'
import { TransactionType } from '~/constants/enums'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBodyType } from '~/schemaValidations/admins.schema'
import {
  CreateTransactionBodyType,
  GetUserTransactionByIdParamsType,
  GetUserTransactionByTimeQueryType,
  TransactionTypeCategoryType,
  UpdateUserTransactionBodyType
} from '~/schemaValidations/transactions.schema'

class TransactionsService {
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

  async getUserTransactionById(params: GetUserTransactionByIdParamsType, user_id: string) {
    const result = await prisma.transactions.findFirstOrThrow({
      where: { id: params.id, user_id, deleted_at: null },
      select: {
        id: true,
        amount_of_money: true,
        transaction_type_category: {
          select: {
            icon: true,
            name: true
          }
        },
        money_account: {
          select: {
            money_account_type: {
              select: {
                icon: true,
                name: true
              }
            }
          }
        },
        occur_date: true,
        description: true,
        related_party: true,
        reminder_date: true,
        save_to_report: true
      }
    })
    return result
  }

  async getUserTransactionByTime(query: GetUserTransactionByTimeQueryType, user_id: string) {
    // Handle query params: from, to, money_account_id
    // Check valid each query parameter
    let fromDate: Date | undefined
    let toDate: Date | undefined

    if (query.from && query.to) {
      fromDate = new Date(query.from)
      toDate = new Date(query.to)
      toDate.setHours(23, 59, 59, 999)
    }

    const whereCondition: any = {
      user_id,
      deleted_at: null
    }

    if (fromDate && toDate) {
      whereCondition.occur_date = {
        gte: fromDate,
        lte: toDate
      }
    }

    let currentAccountBalance = new Decimal(0)
    let moneyAccountCreditLimit: Decimal | undefined = undefined
    let availableAccoutBalance: Decimal | undefined = undefined
    if (query.money_account_id) {
      // Set condition to find money_account_id
      whereCondition.money_account_id = query.money_account_id
      // Calulate parameters
      const moneyAccount = (await prisma.money_accounts.findUnique({
        where: { id: query.money_account_id },
        select: { account_balance: true, credit_limit: true }
      })) as { account_balance: Decimal; credit_limit: Decimal | null }

      if (moneyAccount.credit_limit) {
        moneyAccountCreditLimit = moneyAccount.credit_limit
        availableAccoutBalance = moneyAccount.account_balance.plus(moneyAccountCreditLimit)
      }

      currentAccountBalance = moneyAccount.account_balance
    }

    const transactions = await prisma.transactions.findMany({
      where: whereCondition,
      select: {
        id: true,
        amount_of_money: true,
        transaction_type_category: {
          select: {
            id: true,
            icon: true,
            name: true,
            parent_id: true,
            transaction_type: {
              select: {
                type: true
              }
            }
          }
        },
        money_account: {
          select: {
            id: true,
            account_balance: true,
            name: true,
            money_account_type: {
              select: {
                icon: true,
                name: true
              }
            }
          }
        },
        description: true,
        occur_date: true,
        save_to_report: true,
        related_party: true,
        reminder_date: true,
        event_id: true
      },
      orderBy: { occur_date: 'desc' }
    })
    /**
     * Convert data to format:
     * {
     *  transactions_by_date: {
     *    'date': {
     *      transactions: [transaction1, transaction2, ...],
     *      total_expense: ...,
     *      total_income: ...
     *    }
     *  },
     *  total_all_expense: ...,
     *  total_all_income: ...,
     *  current_account_balance: ...,
     *  money_account_credit_limit: ...,
     *  available_account_balance: ...
     * }
     */
    let total_all_expense = new Decimal(0)
    let total_all_income = new Decimal(0)
    const groupedByTransactions = transactions.reduce(
      (
        acc: Record<string, { transactions: (typeof transaction)[]; total_expense: Decimal; total_income: Decimal }>,
        transaction
      ) => {
        const date = transaction.occur_date.toISOString().split('T')[0]
        const transactionType = transaction.transaction_type_category.transaction_type.type

        if (!acc[date]) {
          acc[date] = {
            transactions: [],
            total_expense: new Decimal(0),
            total_income: new Decimal(0)
          }
        }
        acc[date].transactions.push(transaction)

        if (transactionType === TransactionType.Expense) {
          acc[date].total_expense = acc[date].total_expense.plus(transaction.amount_of_money)
          total_all_expense = total_all_expense.plus(transaction.amount_of_money)
        } else {
          acc[date].total_income = acc[date].total_income.plus(transaction.amount_of_money)
          total_all_income = total_all_income.plus(transaction.amount_of_money)
        }
        return acc
      },
      {}
    )
    return {
      transactions_by_date: groupedByTransactions,
      total_all_expense: total_all_expense,
      total_all_income: total_all_income,
      current_account_balance: currentAccountBalance,
      money_account_credit_limit: moneyAccountCreditLimit,
      available_account_balance: availableAccoutBalance
    }
  }

  async softDeleteUserTransactionById(params: GetUserTransactionByIdParamsType, user_id: string) {
    /**
     * Logic:
     * 1. Get transaction type (Expense or Income) of the transaction
     * 2. Based on type, update (+) (-) account balance accordingly
     */
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transactions.findUnique({
        where: { id: params.id, user_id },
        select: {
          amount_of_money: true,
          transaction_type_category: {
            select: {
              transaction_type: {
                select: {
                  type: true
                }
              }
            }
          },
          money_account_id: true
        }
      })

      const transactionType = transaction!.transaction_type_category.transaction_type.type

      if (transactionType === TransactionType.Expense) {
        await tx.money_accounts.update({
          where: { id: transaction!.money_account_id },
          data: {
            account_balance: { increment: transaction!.amount_of_money }
          }
        })
      } else {
        await tx.money_accounts.update({
          where: { id: transaction!.money_account_id },
          data: {
            account_balance: { decrement: transaction!.amount_of_money }
          }
        })
      }

      await tx.transactions.update({
        where: { id: params.id, user_id },
        data: { deleted_at: new Date() }
      })
    })
    return true
  }

  async updateUserTransaction(user_id: string, body: UpdateUserTransactionBodyType) {
    /**
     * Logic:
     * 1. Get current transaction and new (update) transaction type
     * 2. Check type (Expense or Income) of 1.
     * 3. If type Expense <=> Income
     *  - Expense:
     *      Increment: currentAmountOfMoney in current(old)Transaction
     *      Increment: updateAmountOfMoney in new(update)Transaction
     * - Income:
     *      Decrement: currentAmountOfMoney in current(old)Transaction
     *      Decrement: updateAmountOfMoney in new(update)Transaction
     * 4. If type Income -> Income or Expense -> Expense (same type)
     *  - Expense:
     *      Increment: currentAmountOfMoney in current(old)Transaction
     *      Decrement: updateAmountOfMoney in new(update)Transaction
     * - Income:
     *     Decrement: currentAmountOfMoney in current(old)Transaction
     *     Increment: updateAmountOfMoney in new(update)Transaction
     * => Be money_account may change
     *    Must (+) (-) current(old), new(update) amount to old money_account, new money_account balance
     */
    await prisma.$transaction(async (tx) => {
      const [currentTransaction, updateTransactionType] = await Promise.all([
        tx.transactions.findUnique({
          where: { id: body.id, user_id },
          select: {
            amount_of_money: true,
            transaction_type_category: {
              select: {
                transaction_type: {
                  select: {
                    type: true
                  }
                }
              }
            },
            money_account_id: true,
            money_account: {
              select: {
                account_balance: true
              }
            }
          }
        }),
        tx.transaction_type_categories.findUnique({
          where: { id: body.transaction_type_category_id },
          select: {
            transaction_type: {
              select: {
                type: true
              }
            }
          }
        })
      ])

      const currentAmountOfMoney = currentTransaction!.amount_of_money.toNumber()
      const updateAmountOfMoney = body.amount_of_money
      const currentTransactionType = currentTransaction!.transaction_type_category.transaction_type.type
      const changedTransactionType =
        currentTransaction!.transaction_type_category.transaction_type.type !==
        updateTransactionType!.transaction_type.type

      if (changedTransactionType) {
        if (currentTransactionType === TransactionType.Expense) {
          await Promise.all([
            tx.money_accounts.update({
              where: { id: currentTransaction!.money_account_id },
              data: { account_balance: { increment: currentAmountOfMoney } }
            }),
            tx.money_accounts.update({
              where: { id: body.money_account_id },
              data: { account_balance: { increment: updateAmountOfMoney } }
            })
          ])
        } else {
          await Promise.all([
            tx.money_accounts.update({
              where: { id: currentTransaction!.money_account_id },
              data: {
                account_balance: { decrement: currentAmountOfMoney }
              }
            }),
            tx.money_accounts.update({
              where: { id: body.money_account_id },
              data: {
                account_balance: { decrement: updateAmountOfMoney }
              }
            })
          ])
        }
      } else {
        if (currentTransactionType === TransactionType.Expense) {
          await Promise.all([
            tx.money_accounts.update({
              where: { id: currentTransaction!.money_account_id },
              data: {
                account_balance: { increment: currentAmountOfMoney }
              }
            }),
            tx.money_accounts.update({
              where: { id: body.money_account_id },
              data: {
                account_balance: { decrement: updateAmountOfMoney }
              }
            })
          ])
        } else {
          await Promise.all([
            tx.money_accounts.update({
              where: { id: currentTransaction!.money_account_id },
              data: {
                account_balance: { decrement: currentAmountOfMoney }
              }
            }),
            tx.money_accounts.update({
              where: { id: body.money_account_id },
              data: {
                account_balance: { increment: updateAmountOfMoney }
              }
            })
          ])
        }
      }

      await prisma.transactions.update({
        where: { id: body.id, user_id },
        data: { ...body }
      })
    })

    return true
  }
}

const transactionsService = new TransactionsService()
export default transactionsService
