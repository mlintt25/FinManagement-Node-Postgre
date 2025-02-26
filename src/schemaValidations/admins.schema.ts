import z from 'zod'

export const CreateTransactionTypeBody = z
  .object({
    icon: z.string().min(1),
    name: z.string().min(1)
  })
  .strict()

export type CreateTransactionTypeBodyType = z.infer<typeof CreateTransactionTypeBody>

export const CreateTransactionTypeRes = z.object({
  message: z.string()
})

export type CreateTransactionTypeResType = z.infer<typeof CreateTransactionTypeRes>
