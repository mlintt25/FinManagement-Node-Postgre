import z from 'zod'
import { TransactionType } from '~/constants/enums'

export const CreateTransactionTypeBody = z
  .object({
    icon: z.string().min(1),
    name: z.string().min(1),
    type: z.enum([TransactionType.Expense, TransactionType.Income])
  })
  .strict()

export type CreateTransactionTypeBodyType = z.infer<typeof CreateTransactionTypeBody>

export const CreateTransactionTypeRes = z.object({
  message: z.string()
})

export type CreateTransactionTypeResType = z.infer<typeof CreateTransactionTypeRes>

export const CreateTransactionTypeCategoryBody = z
  .object({
    transaction_type_id: z.string().uuid().min(1, { message: 'Transaction type id is required' }),
    icon: z.string().min(1),
    name: z.string().min(1),
    parent_id: z.string().uuid().optional()
  })
  .strict()

export type CreateTransactionTypeCategoryBodyType = z.infer<typeof CreateTransactionTypeCategoryBody>

export const CreateTransactionTypeCategoryRes = z.object({
  message: z.string()
})

export type CreateTransactionTypeCategoryResType = z.infer<typeof CreateTransactionTypeCategoryRes>

export const CreateMoneyAccountTypeBody = z
  .object({
    icon: z.string().min(1),
    name: z.string().min(1)
  })
  .strict()

export type CreateMoneyAccountTypeBodyType = z.infer<typeof CreateMoneyAccountTypeBody>

export const CreateMoneyAccountTypeRes = z.object({
  message: z.string()
})

export type CreateMoneyAccountTypeResType = z.infer<typeof CreateMoneyAccountTypeRes>
