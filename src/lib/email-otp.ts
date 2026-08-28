export const EMAIL_OTP_LENGTH = 6;

export function normalizeEmailOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, EMAIL_OTP_LENGTH);
}

export function isCompleteEmailOtp(value: string) {
  return /^\d{6}$/.test(value);
}
