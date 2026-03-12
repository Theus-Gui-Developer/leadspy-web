import "server-only"

import { createHash } from "node:crypto"

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export function buildTokenPreview(value: string) {
  if (value.length <= 8) {
    return value
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}
