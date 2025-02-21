import prisma from '~/database'
import { ChangePasswordBodyType } from '~/schemaValidations/users.schema'
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
}

const usersService = new UsersService()
export default usersService
