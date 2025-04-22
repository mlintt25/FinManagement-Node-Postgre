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
