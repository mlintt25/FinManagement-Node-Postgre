import { money_accounts, transaction_type_categories } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { MoneyAccountType, TransactionType } from '~/constants/enums'
import prisma from '~/database'
import { CreateTransactionTypeCategoryBodyType } from '~/schemaValidations/admins.schema'
import {
  CreateMoneyAccountBodyType,
  CreateTransactionBodyType,
  GetUserMoneyAccountByIdParamsType,
  GetUserTransactionByIdParamsType,
  TransactionTypeCategoryType,
  UpdateUserMoneyAccountBodyType,
  UpdateUserTransactionBodyType
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
      // Initial balance is equal to account_balance
      const newMoneyAccount = await tx.money_accounts.create({
        data: { ...money_account_body, account_balance: money_account_body.initial_balance, user_id }
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

  async getUserMoneyAccountById(params: GetUserMoneyAccountByIdParamsType, user_id: string) {
    const result = await prisma.money_accounts.findFirstOrThrow({
      where: { id: params.id, user_id },
      select: {
        id: true,
        name: true,
        initial_balance: true,
        money_account_type: {
          select: {
            icon: true,
            name: true
          }
        },
        credit_limit: true,
        bank_type: true,
        description: true,
        reminder_when_due: true,
        credit_card_reminders: {
          select: {
            reminder_time: true,
            payment_due_date: true
          }
        }
      }
    })
    return result
  }

  async deleteUserMoneyAccountById(params: GetUserMoneyAccountByIdParamsType, user_id: string) {
    // Use transaction to make sure that both the transactions and money_accounts are updated
    await prisma.$transaction(async (prisma) => {
      await prisma.transactions.deleteMany({
        where: { money_account_id: params.id, user_id }
      })
      // Delete all reminders of money_account
      await prisma.credit_card_reminders.deleteMany({
        where: { money_account_id: params.id }
      })
      // Delete money_account with id (user_id may or may not be used)
      await prisma.money_accounts.delete({
        where: { id: params.id, user_id }
      })
    })
    return true
  }

  async updateUserMoneyAccount(user_id: string, body: UpdateUserMoneyAccountBodyType) {
    const { reminder_time, payment_due_date, ...money_account_body } = body
    /**
     * Logic:
     * 1. Because only credit card can have reminders, so if the current money account is credit card
     *  and the update money account is not credit card, delete all reminders of the current money account
     * 2. If change initial balance, calculate the new account balance
     * 3. If the update money account is not credit or bank, set bank_type to null
     * 4. If the update money account is credit, create reminders for the new money account
     *  -> Whether it's a change or a new addition, here we still delete and add again from the beginning
     *  because of the logic characteristics according to database.
     */
    const [currentMoneyAccount, updateMoneyAccountType] = await Promise.all([
      prisma.money_accounts.findUnique({
        where: { id: body.id, user_id },
        select: {
          money_account_type_id: true,
          initial_balance: true,
          account_balance: true,
          money_account_type: {
            select: {
              type: true
            }
          }
        }
      }),
      prisma.money_account_types.findUnique({
        where: { id: body.money_account_type_id },
        select: {
          type: true
        }
      })
    ])

    const isCredit = currentMoneyAccount!.money_account_type.type === MoneyAccountType.Credit
    const moneyAccountTypeChanged = currentMoneyAccount!.money_account_type_id !== body.money_account_type_id
    const willBeCredit = updateMoneyAccountType!.type === MoneyAccountType.Credit

    if (isCredit && moneyAccountTypeChanged) {
      await prisma.credit_card_reminders.deleteMany({
        where: { money_account_id: body.id }
      })
    }

    if (
      updateMoneyAccountType &&
      ![MoneyAccountType.Credit, MoneyAccountType.Bank].includes(updateMoneyAccountType.type as MoneyAccountType)
    ) {
      money_account_body.bank_type = null
    }

    const currentInitialBalance = new Decimal(currentMoneyAccount!.initial_balance)
    const updateInitialBalance = new Decimal(money_account_body.initial_balance)
    const newInitialBalance = currentInitialBalance.toNumber() - updateInitialBalance.toNumber()
    const newAccountBalance = currentMoneyAccount!.account_balance.toNumber() - newInitialBalance

    await prisma.money_accounts.update({
      data: {
        ...money_account_body,
        account_balance: newAccountBalance
      },
      where: { id: body.id, user_id }
    })

    if (willBeCredit && Array.isArray(reminder_time) && typeof payment_due_date === 'number') {
      await prisma.credit_card_reminders.deleteMany({ where: { money_account_id: body.id } })

      const reminderData = reminder_time.map((time) => ({
        money_account_id: body.id,
        reminder_time: time,
        payment_due_date
      }))

      if (reminderData.length > 0) {
        await prisma.credit_card_reminders.createMany({ data: reminderData })
      }
    }

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

  async softDeleteUserTransactionById(params: GetUserTransactionByIdParamsType, user_id: string) {
    await prisma.transactions.update({
      where: { id: params.id, user_id },
      data: { deleted_at: new Date() }
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

const appsService = new AppsService()
export default appsService
