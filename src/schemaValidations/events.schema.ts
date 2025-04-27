import z from 'zod'

const EventSchema = z.object({
  icon: z.string().min(1),
  name: z.string().min(1),
  end_date: z.string().datetime(),
  money_accounts: z.array(z.string().uuid()).nonempty({ message: 'Money account id is required' })
})

const EventByIdSchema = z.object({
  id: z.string().uuid(),
  icon: z.string(),
  name: z.string(),
  end_date: z.date().nullable(),
  money_accounts: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string()
    })
  )
})

export const GetAllEventRes = z.object({
  message: z.string(),
  data: z.array(EventByIdSchema)
})

export type GetAllEventResType = z.infer<typeof GetAllEventRes>

export const GetEventByIdRes = z.object({
  message: z.string(),
  data: EventByIdSchema
})

export type GetEventByIdResType = z.infer<typeof GetEventByIdRes>

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

export const GetEventByIdParams = z.object({
  id: z.string().uuid()
})

export type GetEventByIdParamsType = z.infer<typeof GetEventByIdParams>

export const DeleteEventByIdRes = z.object({
  message: z.string()
})

export type DeleteEventByIdResType = z.infer<typeof DeleteEventByIdRes>
