import z from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  verify: z.string(),
  role: z.string(),
  avatar: z.string().nullable()
})

export type UserType = z.TypeOf<typeof UserSchema>
