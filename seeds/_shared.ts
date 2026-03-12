import "dotenv/config"

import { createHash, randomBytes, scryptSync } from "node:crypto"

import postgres from "postgres"

export function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function createSqlClient() {
  return postgres(getRequiredEnv("DATABASE_URL"), {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")

  return `scrypt:${salt}:${hash}`
}

export function addMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  const dayOfMonth = nextDate.getUTCDate()

  nextDate.setUTCMonth(nextDate.getUTCMonth() + months)

  if (nextDate.getUTCDate() < dayOfMonth) {
    nextDate.setUTCDate(0)
  }

  return nextDate
}
