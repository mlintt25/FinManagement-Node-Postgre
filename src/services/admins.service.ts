import { Role, UserVerifyStatus } from '~/constants/enums'
import prisma from '~/database'
import {
  ChangeUserVerifyStatusByIdBodyType,
  CreateMoneyAccountTypeBodyType,
  CreateTransactionTypeBodyType,
  GetUserByIdParamsType,
  UpdateUserByIdBodyType
} from '~/schemaValidations/admins.schema'

class AdminsService {
  async createTransactionType(body: CreateTransactionTypeBodyType) {
    const { icon, name, type } = body
    await prisma.transaction_types.create({
      data: { icon, name, type }
    })
    return true
  }

  async createMoneyAccountType(body: CreateMoneyAccountTypeBodyType) {
    const { icon, name } = body
    await prisma.money_account_types.create({
      data: { icon, name }
    })
    return true
  }

  async getAllMoneyAccountType() {
    const result = await prisma.money_account_types.findMany({
      select: {
        id: true,
        icon: true,
        name: true
      }
    })
    return result
  }

  async getAllUsers() {
    const result = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        phone: true,
        dob: true,
        address: true,
        gender: true,
        job: true,
        verify: true,
        role: true
      },
      where: {
        NOT: {
          role: 'Admin'
        }
      }
    })
    return result
  }

  async getAllAdmins(user_id: string) {
    const result = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        phone: true,
        dob: true,
        address: true,
        gender: true,
        job: true,
        verify: true,
        role: true
      },
      where: {
        id: {
          not: user_id
        },
        role: 'Admin'
      }
    })
    return result
  }

  async getUserById(params: GetUserByIdParamsType) {
    const result = await prisma.users.findUniqueOrThrow({
      where: {
        id: params.id
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        phone: true,
        dob: true,
        address: true,
        gender: true,
        job: true,
        verify: true,
        role: true
      }
    })
    return result
  }

  async changeUserVerifyStatusById(body: ChangeUserVerifyStatusByIdBodyType) {
    await prisma.users.update({
      where: {
        id: body.id
      },
      data: {
        verify: body.verify
      }
    })
    return true
  }

  async updateUserById(body: UpdateUserByIdBodyType) {
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role as Role,
      phone: body.phone,
      avatar: body.avatar,
      dob: body.dob,
      address: body.address,
      gender: body.gender,
      job: body.job
    }
    if (body.verify !== undefined) {
      updateData.verify = body.verify as UserVerifyStatus
    }
    await prisma.users.update({
      data: updateData,
      where: { id: body.id }
    })
    return true
  }

  async deleteUserById(params: GetUserByIdParamsType) {
    await prisma.users.delete({
      where: {
        id: params.id
      }
    })
    return true
  }
}

const adminsService = new AdminsService()
export default adminsService
