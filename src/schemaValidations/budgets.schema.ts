import { Decimal } from '@prisma/client/runtime/library'
import z from 'zod'

const BudgetSchema = z.object({
  money_accounts: z.array(z.string().uuid()).nonempty(),
  transaction_type_categories: z.array(z.string().uuid()).nonempty(),
  name: z.string().min(1),
  amount_of_money: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? undefined : parsed
    }
    return typeof val === 'number' ? val : undefined
  }, z.number().positive()),
  start_date: z.string().datetime(),
  end_date: z.string().datetime()
})

export const CreateBudgetBody = BudgetSchema

export type CreateBudgetBodyType = z.infer<typeof CreateBudgetBody>

export const CreateBudgetRes = z.object({
  message: z.string()
})

export type CreateBudgetResType = z.infer<typeof CreateBudgetRes>

export const GetUserBudgetRes = z.object({
  message: z.string(),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      amount_of_money: z.custom<Decimal>(),
      start_date: z.date(),
      end_date: z.date(),
      money_accounts: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string()
        })
      ),
      transaction_type_categories: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          icon: z.string(),
          parent_id: z.string().nullable()
        })
      ),
      transactions: z.array(
        z.object({
          id: z.string().uuid(),
          amount_of_money: z.custom<Decimal>(),
          occur_date: z.date(),
          transaction_type_category: z.object({
            id: z.string().uuid(),
            name: z.string(),
            icon: z.string()
          }),
          money_account: z.object({
            id: z.string().uuid(),
            name: z.string()
          })
        })
      ),
      total_expenses: z.number(),
      remaining_budget_amount: z.number(),
      actual_expenses: z.number(),
      should_expenses: z.number(),
      expected_expenses: z.number()
    })
  )
})

export type GetUserBudgetResType = z.infer<typeof GetUserBudgetRes>

export const GetUserBudgetByIdParams = z.object({
  id: z.string().uuid()
})

export type GetUserBudgetByIdParamsType = z.infer<typeof GetUserBudgetByIdParams>

export const GetUserBudgetByIdRes = z.object({
  message: z.string(),
  data: z.object({
    budget: z.object({
      id: z.string().uuid(),
      name: z.string(),
      amount_of_money: z.custom<Decimal>(),
      start_date: z.date(),
      end_date: z.date(),
      money_accounts: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string()
        })
      ),
      transaction_type_categories: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          icon: z.string(),
          parent_id: z.string().nullable()
        })
      ),
      transactions: z.array(
        z.object({
          id: z.string().uuid(),
          amount_of_money: z.custom<Decimal>(),
          occur_date: z.date(),
          transaction_type_category: z.object({
            id: z.string().uuid(),
            name: z.string(),
            icon: z.string()
          }),
          money_account: z.object({
            id: z.string().uuid(),
            name: z.string()
          })
        })
      )
    }),
    total_expenses: z.number(),
    remaining_budget_amount: z.number(),
    actual_expenses: z.number(),
    should_expenses: z.number(),
    expected_expenses: z.number()
  })
})

export type GetUserBudgetByIdResType = z.infer<typeof GetUserBudgetByIdRes>
