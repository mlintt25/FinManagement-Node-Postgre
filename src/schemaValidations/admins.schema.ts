import z from 'zod'
import { Role, TransactionType, UserVerifyStatus } from '~/constants/enums'

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
  avatar: z.string().nullable().optional(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  dob: z.date().nullable().optional(),
  address: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
  verify: z.string().optional(),
  role: z.string()
})

export const GetAllUsersRes = z.object({
  message: z.string(),
  data: z.array(UserSchema)
})

export type GetAllUsersResType = z.infer<typeof GetAllUsersRes>

export const GetUserByIdParams = z.object({
  id: z.string().uuid()
})

export type GetUserByIdParamsType = z.infer<typeof GetUserByIdParams>

export const GetUserByIdRes = z.object({
  message: z.string(),
  data: UserSchema
})

export type GetUserByIdResType = z.infer<typeof GetUserByIdRes>

export const ChangeUserVerifyStatusByIdBody = z.object({
  id: z.string().uuid(),
  verify: z.enum([UserVerifyStatus.Verified, UserVerifyStatus.Unverified, UserVerifyStatus.Banned])
})

export type ChangeUserVerifyStatusByIdBodyType = z.infer<typeof ChangeUserVerifyStatusByIdBody>

export const ChangeUserVerifyStatusByIdRes = z.object({
  message: z.string()
})

export type ChangeUserVerifyStatusByIdResType = z.infer<typeof ChangeUserVerifyStatusByIdRes>

export const UpdateUserByIdBody = UserSchema.extend({
  verify: z.enum([UserVerifyStatus.Verified, UserVerifyStatus.Unverified, UserVerifyStatus.Banned]).optional(),
  role: z.enum([Role.Admin, Role.User]),
  gender: z.enum(['Male', 'Female', 'Other']).nullable().optional(),
  dob: z.string().datetime().nullable().optional()
})

export type UpdateUserByIdBodyType = z.infer<typeof UpdateUserByIdBody>

export const UpdateUserByIdRes = z.object({
  message: z.string()
})

export type UpdateUserByIdResType = z.infer<typeof UpdateUserByIdRes>

export const DeleteUserByIdRes = z.object({
  message: z.string()
})

export type DeleteUserByIdResType = z.infer<typeof DeleteUserByIdRes>
