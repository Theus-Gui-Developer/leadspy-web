import "server-only"

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOptionalEnv(name: string) {
  return process.env[name]
}

function getOptionalNumberEnv(name: string, fallback: number) {
  const value = process.env[name]

  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

export const env = {
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  APP_URL: getOptionalEnv("APP_URL"),
  RESEND_API_KEY: getOptionalEnv("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: getOptionalEnv("RESEND_FROM_EMAIL"),
  SESSION_SECRET: getRequiredEnv("SESSION_SECRET"),
  FIRECRAWL_API_URL: getOptionalEnv("FIRECRAWL_API_URL"),
  ACCESS_TOKEN_COOKIE_NAME:
    getOptionalEnv("ACCESS_TOKEN_COOKIE_NAME") ?? "leadspy_access",
  REFRESH_TOKEN_COOKIE_NAME:
    getOptionalEnv("REFRESH_TOKEN_COOKIE_NAME") ?? "leadspy_refresh",
  PASSWORD_SETUP_TOKEN_TTL_HOURS: getOptionalNumberEnv(
    "PASSWORD_SETUP_TOKEN_TTL_HOURS",
    48,
  ),
  AUTH_ACCESS_TOKEN_TTL_MINUTES: getOptionalNumberEnv(
    "AUTH_ACCESS_TOKEN_TTL_MINUTES",
    15,
  ),
  AUTH_REFRESH_TOKEN_TTL_DAYS: getOptionalNumberEnv(
    "AUTH_REFRESH_TOKEN_TTL_DAYS",
    30,
  ),
} as const
