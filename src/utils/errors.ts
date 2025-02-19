import { Prisma } from '@prisma/client'
import HTTP_STATUS from '~/constants/httpStatus'

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class AuthError extends ErrorWithStatus {
  constructor(message: string) {
    super({ message, status: HTTP_STATUS.UNAUTHORIZED })
  }
}

export class EntityError extends ErrorWithStatus {
  errorInfo: { message: string; field: string }[]
  constructor(errorInfo: { message: string; field: string }[]) {
    super({ message: 'Unprocessable entity...', status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errorInfo = errorInfo
  }
}

export class ForbiddenError extends ErrorWithStatus {
  constructor(message: string) {
    super({ message, status: HTTP_STATUS.FORBIDDEN })
  }
}

export function isPrismaClientKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError
}

export function isPrismaClientInitializationError(error: unknown): error is Prisma.PrismaClientInitializationError {
  return error instanceof Prisma.PrismaClientInitializationError
}
