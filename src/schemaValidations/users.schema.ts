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
