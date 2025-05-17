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

const TransactionTypeCategorySchema = z
  .object({
    transaction_type_id: z.string().uuid(),
    icon: z.string().min(1),
    name: z.string().min(1),
    parent_id: z.string().uuid().optional().nullable()
  })
  .strict()

export const CreateTransactionTypeCategoryBody = TransactionTypeCategorySchema

export type CreateTransactionTypeCategoryBodyType = z.infer<typeof CreateTransactionTypeCategoryBody>

export const CreateTransactionTypeCategoryRes = z.object({
  message: z.string()
})

export type CreateTransactionTypeCategoryResType = z.infer<typeof CreateTransactionTypeCategoryRes>

export const UpdateTransactionTypeCategoryBody = TransactionTypeCategorySchema.extend({
  id: z.string().uuid()
})

export type UpdateTransactionTypeCategoryBodyType = z.infer<typeof UpdateTransactionTypeCategoryBody>

export const UpdateTransactionTypeCategoryRes = z.object({
  message: z.string()
})

export type UpdateTransactionTypeCategoryResType = z.infer<typeof UpdateTransactionTypeCategoryRes>

export const GetTransactionTypeCategoryByIdParams = z.object({
  id: z.string().uuid()
})

export type GetTransactionTypeCategoryByIdParamsType = z.infer<typeof GetTransactionTypeCategoryByIdParams>

export const DeleteTransactionTypeCategoryRes = z.object({
  message: z.string()
})

export type DeleteTransactionTypeCategoryResType = z.infer<typeof DeleteTransactionTypeCategoryRes>

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

export const AllMoneyAccountTypeRes = z.object({
  message: z.string(),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      icon: z.string(),
      name: z.string()
    })
  )
})

export type AllMoneyAccountTypeResType = z.infer<typeof AllMoneyAccountTypeRes>

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable(),
  email: z.string(),
  phone: z.string().nullable(),
  dob: z.date().nullable(),
  address: z.string().nullable(),
  gender: z.string().nullable(),
  job: z.string().nullable(),
  verify: z.string(),
  role: z.string()
})

export const GetAllUsersRes = z.object({
  message: z.string(),
  data: z.array(UserSchema)
})

export type GetAllUsersResType = z.infer<typeof GetAllUsersRes>
