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

const TransactionSchema = z.object({
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
  event_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  related_party: z.string().optional().nullable(),
  reminder_date: z.string().datetime().optional().nullable()
})

export const CreateTransactionBody = TransactionSchema

export type CreateTransactionBodyType = z.infer<typeof CreateTransactionBody>

export const CreateTransactionRes = z.object({
  message: z.string()
})

export type CreateTransactionResType = z.infer<typeof CreateTransactionRes>

export const GetUserTransactionByIdParams = z.object({
  id: z.string().uuid()
})

export type GetUserTransactionByIdParamsType = z.infer<typeof GetUserTransactionByIdParams>

export const GetUserTransactionByIdRes = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    amount_of_money: z.custom<Decimal>(),
    transaction_type_category: z.object({
      icon: z.string(),
      name: z.string()
    }),
    money_account: z.object({
      money_account_type: z.object({
        icon: z.string(),
        name: z.string()
      })
    }),
    occur_date: z.date(),
    description: z.string().nullable(),
    related_party: z.string().nullable(),
    reminder_date: z.date().nullable(),
    save_to_report: z.boolean()
  })
})

export type GetUserTransactionByIdResType = z.infer<typeof GetUserTransactionByIdRes>

export const DeleteUserTransactionByIdRes = z.object({
  message: z.string()
})

export type DeleteUserTransactionByIdResType = z.infer<typeof DeleteUserTransactionByIdRes>

export const UpdateUserTransactionBody = TransactionSchema.extend({
  id: z.string().uuid()
})

export type UpdateUserTransactionBodyType = z.infer<typeof UpdateUserTransactionBody>

export const UpdateUserTransactionRes = z.object({
  message: z.string()
})

export type UpdateUserTransactionResType = z.infer<typeof UpdateUserTransactionRes>
