export const SPARK_AUTH_REDIRECT_ORIGINS = {
  production: "https://spark.thuanngo.com",
  development: "http://localhost:3000",
} as const;

const ALLOWED_SPARK_AUTH_REDIRECT_ORIGINS = new Set<string>(
  Object.values(SPARK_AUTH_REDIRECT_ORIGINS),
);

export function resolveSparkAuthRedirectOrigin(configuredOrigin: string | undefined) {
  const value = configuredOrigin?.trim();
  if (!value) {
    throw new Error("Spark auth redirect origin is not configured.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Spark auth redirect origin is invalid.");
  }

  const normalizedValue = value.endsWith("/") ? value.slice(0, -1) : value;
  if (
    parsed.origin !== normalizedValue ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    !ALLOWED_SPARK_AUTH_REDIRECT_ORIGINS.has(parsed.origin)
  ) {
    throw new Error("Spark auth redirect origin is not allowed.");
  }

  return parsed.origin;
}

export function createSparkEmailOtpRequest(
  email: string,
  configuredOrigin: string | undefined,
) {
  return {
    email: email.trim(),
    options: {
      emailRedirectTo: resolveSparkAuthRedirectOrigin(configuredOrigin),
    },
  };
}
