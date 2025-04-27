import z from 'zod'

const EventSchema = z.object({
  icon: z.string().min(1),
  name: z.string().min(1),
  end_date: z.string().datetime(),
  money_accounts: z.array(z.string().uuid()).nonempty({ message: 'Money account id is required' })
})

export const CreateEventBody = EventSchema

export type CreateEventBodyType = z.infer<typeof CreateEventBody>

export const CreateEventRes = z.object({
  message: z.string()
})

export type CreateEventResType = z.infer<typeof CreateEventRes>

export const UpdateEventBody = EventSchema.extend({
  id: z.string().uuid()
})

export type UpdateEventBodyType = z.infer<typeof UpdateEventBody>

export const UpdateEventRes = z.object({
  message: z.string()
})

export type UpdateEventResType = z.infer<typeof UpdateEventRes>
