import z from 'zod'

export const LoginBody = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100)
  })
  .strict()

export type LoginBodyType = z.infer<typeof LoginBody>

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

export type LoginResType = z.infer<typeof LoginRes>

export const LoginWithGoogleBody = z.object({
  idToken: z.string()
})

export type LoginWithGoogleBodyType = z.infer<typeof LoginWithGoogleBody>

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

export type RegisterBodyType = z.infer<typeof RegisterBody>

export const RegisterRes = z.object({
  message: z.string()
})

export type RegisterResType = z.infer<typeof RegisterRes>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  }),
  message: z.string()
})

export type RefreshTokenResType = z.infer<typeof RefreshTokenRes>

export type LogoutBodyType = RefreshTokenBodyType

export const LogoutRes = z.object({
  message: z.string()
})

export type LogoutResType = z.infer<typeof LogoutRes>

export const EmailVerifyTokenBody = z.object({
  email_verify_token: z.string()
})

export type EmailVerifyTokenBodyType = z.infer<typeof EmailVerifyTokenBody>

export const EmailVerifyTokenRes = z.object({
  message: z.string()
})

export type EmailVerifyTokenResType = z.infer<typeof EmailVerifyTokenRes>

export const SendEmailVerifyTokenRes = z.object({
  message: z.string()
})

export type SendEmailVerifyTokenResType = z.infer<typeof SendEmailVerifyTokenRes>
