export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized',
  USER_NOT_FOUND: 'User not found',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  LOGOUT_SUCCESS: 'Logout success',
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success'
} as const

export const ADMINS_MESSAGES = {
  ADD_TRANSACTION_TYPE_SUCCESS: 'Create transaction type success',
  TRANSACTION_TYPE_ALREADY_EXISTS: 'Transaction type already exists'
} as const
