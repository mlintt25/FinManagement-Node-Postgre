import prisma from '~/database'
import {
  ChangePasswordBodyType,
  CreateUserPersonalizationBodyType,
  UpdateUserPersonalizationBodyType
} from '~/schemaValidations/users.schema'
import { hashPassword } from '~/utils/hash'

class UsersService {
  async changePassword(user_id: string, body: ChangePasswordBodyType) {
    const { newPassword } = body
    const hashedPassword = await hashPassword(newPassword)

    await prisma.users.update({
      where: { id: user_id },
      data: { password: hashedPassword }
    })

    return true
  }

  async getUserPersonalization(user_id: string) {
    const userPersonalization = await prisma.user_personalizations.findFirstOrThrow({
      where: { user_id },
      select: {
        id: true,
        occupation: true,
        monthly_income: true,
        financial_goals: true
      }
    })
    return userPersonalization
  }

  async getUserPersonalizationStatus(user_id: string) {
    const userPersonalization = await prisma.user_personalizations.findFirst({
      where: { user_id },
      select: {
        id: true,
        occupation: true,
        monthly_income: true,
        financial_goals: true
      }
    })

    if (!userPersonalization) {
      return false
    }

    return true
  }

  async createUserPersonalization(user_id: string, body: CreateUserPersonalizationBodyType) {
    await prisma.user_personalizations.create({
      data: {
        user_id,
        ...body
      }
    })
    return true
  }

  async updateUserPersonalization(user_id: string, body: UpdateUserPersonalizationBodyType) {
    await prisma.user_personalizations.update({
      where: { id: body.id, user_id },
      data: body
    })
    return true
  }
}

const usersService = new UsersService()
export default usersService
