import { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'
import omit from 'lodash/omit'
import { ZodError } from 'zod'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/utils/errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ZodError) {
      const { issues } = err
      const errors = issues.map((issue) => {
        return {
          message: issue.message,
          field: issue.path.join('.')
        }
      })
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .json({ message: 'Unprocessable entity...', errorInfo: errors })
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: capitalize(err.message) })
    }
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }
    const finalError: any = {}
    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return
      }
      finalError[key] = err[key]
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      errorInfo: omit(finalError, ['stack'])
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(error as any, ['stack'])
    })
  }
}
