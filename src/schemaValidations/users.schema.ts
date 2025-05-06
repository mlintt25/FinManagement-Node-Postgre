import z from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  verify: z.string(),
  role: z.string(),
  avatar: z.string().nullable()
})

export type UserType = z.infer<typeof UserSchema>

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string(),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100)
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Password does not match',
    path: ['confirmNewPassword']
  })

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBody>

export const ChangePasswordRes = z.object({
  message: z.string()
})

export type ChangePasswordResType = z.infer<typeof ChangePasswordRes>

export const CreateUserPersonalizationBody = z
  .object({
    occupation: z.string(),
    monthly_income: z.preprocess((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? undefined : parsed
      }
      return typeof val === 'number' ? val : undefined
    }, z.number().nonnegative()),
    financial_goals: z.array(z.string())
  })
  .strict()

export type CreateUserPersonalizationBodyType = z.infer<typeof CreateUserPersonalizationBody>

export const CreateUserPersonalizationRes = z.object({
  message: z.string()
})

export type CreateUserPersonalizationResType = z.infer<typeof CreateUserPersonalizationRes>
