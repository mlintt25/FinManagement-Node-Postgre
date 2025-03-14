import { Decimal } from '@prisma/client/runtime/library'
import z from 'zod'

export const TransactionTypeCategorySchema = z.object({
  id: z.string().uuid(),
  transaction_type_id: z.string().uuid(),
  icon: z.string(),
  name: z.string(),
  parent_id: z.string().uuid().nullable().optional(),
  children: z.array(z.object({})).optional()
})

export type TransactionTypeCategoryType = z.infer<typeof TransactionTypeCategorySchema>

export const AllTransactionTypeCategoriesRes = z.object({
  message: z.string(),
  data: z.object({
    expense: z.array(TransactionTypeCategorySchema),
    income: z.array(TransactionTypeCategorySchema)
  })
})

export type AllTransactionTypeCategoriesResType = z.infer<typeof AllTransactionTypeCategoriesRes>

export const CreateTransactionBody = z.object({
  transaction_type_category_id: z.string().uuid(),
  money_account_id: z.string().uuid(),
  amount_of_money: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? undefined : parsed
    }
    return typeof val === 'number' ? val : undefined
  }, z.number().nonnegative()),
  occur_date: z.string().datetime().optional(),
  save_to_report: z.boolean().optional(),
  event_id: z.string().uuid().optional(),
  description: z.string().optional(),
  related_party: z.string().optional(),
  reminder_date: z.string().datetime().optional()
})

export type CreateTransactionBodyType = z.infer<typeof CreateTransactionBody>

export const CreateTransactionRes = z.object({
  message: z.string()
})

export type CreateTransactionResType = z.infer<typeof CreateTransactionRes>

export const CreateMoneyAccountBody = z
  .object({
    money_account_type_id: z.string().uuid(),
    name: z.string().min(1),
    account_balance: z.preprocess((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? undefined : parsed
      }
      return typeof val === 'number' ? val : undefined
    }, z.number().nonnegative()),

    save_to_report: z.boolean().optional(),

    bank_type: z.number().int().nonnegative().optional(),

    credit_limit: z.preprocess((val) => {
      if (val === '') return null
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? undefined : parsed
      }
      return typeof val === 'number' ? val : undefined
    }, z.number().positive().optional().nullable()),

    description: z.string().optional(),
    reminder_when_due: z.boolean().optional(),
    payment_due_date: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? Number(val) : val))
      .pipe(z.number().int().min(1).max(31))
      .optional(),

    reminder_time: z.array(z.string()).optional()
  })
  .strict()

export type CreateMoneyAccountBodyType = z.infer<typeof CreateMoneyAccountBody>

export const CreateMoneyAccountRes = z.object({
  message: z.string()
})

export type CreateMoneyAccountResType = z.infer<typeof CreateMoneyAccountRes>

export const GetUserMoneyAccountRes = z.object({
  message: z.string(),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      account_balance: z.custom<Decimal>(), // Kiểm tra kiểu Decimal
      money_account_type: z.object({
        icon: z.string()
      })
    })
  )
})

export type GetUserMoneyAccountResType = z.infer<typeof GetUserMoneyAccountRes>
