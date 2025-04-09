import { Decimal } from '@prisma/client/runtime/library'
import { MoneyAccountType } from '~/constants/enums'
import prisma from '~/database'
import {
  CreateMoneyAccountBodyType,
  GetUserMoneyAccountByIdParamsType,
  UpdateUserMoneyAccountBodyType
} from '~/schemaValidations/money-accounts.schema'

class MoneyAccountsService {
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
            id: true,
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
}

const moneyAccountsService = new MoneyAccountsService()
export default moneyAccountsService
