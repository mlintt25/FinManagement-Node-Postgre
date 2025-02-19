export enum UserVerifyStatus {
  Unverified = 'Unverified',
  Verified = 'Verified',
  Banned = 'Banned'
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum Role {
  User = 'User', // Default
  Admin = 'Admin'
}
