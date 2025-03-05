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

export enum TransactionType {
  Expense = 'Expense',
  Income = 'Income'
}

export enum MoneyAccountType {
  Cash = 'Cash',
  Bank = 'Bank',
  Invest = 'Invest',
  Credit = 'Credit',
  Another = 'Another'
}
