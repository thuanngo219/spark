import { describe, expect, it } from "vitest";
import { EMAIL_OTP_LENGTH, isCompleteEmailOtp, normalizeEmailOtp } from "@/lib/email-otp";

describe("email OTP", () => {
  it("keeps only the first six digits when typing or pasting", () => {
    expect(EMAIL_OTP_LENGTH).toBe(6);
    expect(normalizeEmailOtp("12a 3456-78")).toBe("123456");
  });

  it("accepts only an exact six-digit code", () => {
    expect(isCompleteEmailOtp("123456")).toBe(true);
    expect(isCompleteEmailOtp("12345")).toBe(false);
    expect(isCompleteEmailOtp("1234567")).toBe(false);
    expect(isCompleteEmailOtp("12345a")).toBe(false);
  });
});
