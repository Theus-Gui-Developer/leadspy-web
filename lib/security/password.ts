import "server-only"

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const SCRYPT_KEY_LENGTH = 64
const MIN_PASSWORD_LENGTH = 8

export function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }

  if (password.length > 128) {
    return "A senha nao pode ter mais de 128 caracteres."
  }

  return null
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex")

  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, encodedPassword: string) {
  const [algorithm, salt, storedHash] = encodedPassword.split(":")

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false
  }

  const derivedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH)
  const storedBuffer = Buffer.from(storedHash, "hex")

  if (storedBuffer.length !== derivedHash.length) {
    return false
  }

  return timingSafeEqual(storedBuffer, derivedHash)
}
