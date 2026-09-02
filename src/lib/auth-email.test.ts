import { describe, expect, it } from "vitest";
import {
  createSparkEmailOtpRequest,
  SPARK_AUTH_REDIRECT_ORIGINS,
} from "@/lib/auth-email";

describe("createSparkEmailOtpRequest", () => {
  it("passes the exact Spark production origin as emailRedirectTo", () => {
    const request = createSparkEmailOtpRequest(
      "  user@example.com  ",
      SPARK_AUTH_REDIRECT_ORIGINS.production,
    );

    expect(request).toEqual({
      email: "user@example.com",
      options: {
        emailRedirectTo: "https://spark.thuanngo.com",
      },
    });

    const serializedRequest = JSON.stringify(request);
    expect(serializedRequest).not.toContain("idea.thuanngo.com");
    expect(serializedRequest).not.toContain("atelier.thuanngo.com");
    expect(serializedRequest).not.toContain("atelier-dev.thuanngo.com");
  });

  it("supports the allowlisted local development origin", () => {
    expect(
      createSparkEmailOtpRequest(
        "user@example.com",
        SPARK_AUTH_REDIRECT_ORIGINS.development,
      ).options.emailRedirectTo,
    ).toBe("http://localhost:3000");
  });

  it.each([
    "https://idea.thuanngo.com",
    "https://atelier.thuanngo.com",
    "https://atelier-dev.thuanngo.com",
  ])("rejects another app origin: %s", (origin) => {
    expect(() => createSparkEmailOtpRequest("user@example.com", origin)).toThrow(
      "Spark auth redirect origin is not allowed.",
    );
  });
});
