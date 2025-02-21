import z from 'zod'

export const LoginBody = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100)
  })
  .strict()

export type LoginBodyType = z.TypeOf<typeof LoginBody>

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      verify: z.string(),
      role: z.string(),
      avatar: z.string().nullable()
    })
  }),
  message: z.string()
})

export type LoginResType = z.TypeOf<typeof LoginRes>

export const RegisterBody = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100)
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword']
  })

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>

export const RegisterRes = z.object({
  message: z.string()
})

export type RegisterResType = z.TypeOf<typeof RegisterRes>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  }),
  message: z.string()
})

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>

export type LogoutBodyType = RefreshTokenBodyType

export const LogoutRes = z.object({
  message: z.string()
})

export type LogoutResType = z.TypeOf<typeof LogoutRes>
