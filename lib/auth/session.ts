import "server-only"

import { createHmac, randomBytes } from "node:crypto"

import { cookies } from "next/headers"

import { and, desc, eq, gt, isNull, or } from "drizzle-orm"

import { expireSubscriptionsForUser } from "@/lib/billing/subscriptions"
import { db } from "@/lib/db"
import { authSessions, subscriptions, users } from "@/lib/db/schema"
import { env } from "@/lib/env"

export type SessionClient = "web" | "extension"
export type SessionTokenKind = "access" | "refresh"

type IssueSessionParams = {
  userId: string
  client: SessionClient
  installationId?: string | null
  userAgent?: string | null
  ipAddress?: string | null
}

type SessionRecord = {
  sessionId: string
  userId: string
  client: SessionClient
  status: "active" | "revoked" | "expired"
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}

type AuthenticatedUser = {
  userId: string
  email: string
  name: string
  role: "admin" | "customer"
  sessionId: string
  sessionClient: SessionClient
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}

type RawSessionTokens = {
  accessToken: string
  refreshToken: string
}

function hashToken(rawToken: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(rawToken).digest("hex")
}

function createRawToken() {
  return randomBytes(32).toString("hex")
}

function createAccessTokenExpirationDate() {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + env.AUTH_ACCESS_TOKEN_TTL_MINUTES)
  return expiresAt
}

function createRefreshTokenExpirationDate() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.AUTH_REFRESH_TOKEN_TTL_DAYS)
  return expiresAt
}

function getCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  }
}

function getRequestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

async function getCookieStore() {
  return cookies()
}

async function upsertSessionRecord(params: {
  userId: string
  client: SessionClient
  installationId?: string | null
  userAgent?: string | null
  ipAddress?: string | null
  accessTokenHash: string
  refreshTokenHash: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}) {
  const [existingSession] = await db
    .select({ id: authSessions.id })
    .from(authSessions)
    .where(
      and(eq(authSessions.userId, params.userId), eq(authSessions.client, params.client)),
    )
    .limit(1)

  if (existingSession) {
    const [updatedSession] = await db
      .update(authSessions)
      .set({
        accessTokenHash: params.accessTokenHash,
        refreshTokenHash: params.refreshTokenHash,
        installationId: params.installationId ?? null,
        status: "active",
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        lastUsedAt: new Date(),
        lastRefreshedAt: new Date(),
        accessTokenExpiresAt: params.accessTokenExpiresAt,
        refreshTokenExpiresAt: params.refreshTokenExpiresAt,
        revokedAt: null,
      })
      .where(eq(authSessions.id, existingSession.id))
      .returning({ id: authSessions.id })

    return updatedSession.id
  }

  const [createdSession] = await db
    .insert(authSessions)
    .values({
      userId: params.userId,
      client: params.client,
      accessTokenHash: params.accessTokenHash,
      refreshTokenHash: params.refreshTokenHash,
      installationId: params.installationId ?? null,
      status: "active",
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      accessTokenExpiresAt: params.accessTokenExpiresAt,
      refreshTokenExpiresAt: params.refreshTokenExpiresAt,
    })
    .returning({ id: authSessions.id })

  return createdSession.id
}

async function findSessionByToken(rawToken: string, kind: SessionTokenKind) {
  const tokenHash = hashToken(rawToken)

  const [session] = await db
    .select({
      sessionId: authSessions.id,
      userId: authSessions.userId,
      client: authSessions.client,
      status: authSessions.status,
      accessTokenExpiresAt: authSessions.accessTokenExpiresAt,
      refreshTokenExpiresAt: authSessions.refreshTokenExpiresAt,
    })
    .from(authSessions)
    .where(
      eq(
        kind === "access" ? authSessions.accessTokenHash : authSessions.refreshTokenHash,
        tokenHash,
      ),
    )
    .limit(1)

  return session ?? null
}

async function markSessionExpiredIfNeeded(session: SessionRecord, kind: SessionTokenKind) {
  const now = new Date()
  const expiresAt =
    kind === "access" ? session.accessTokenExpiresAt : session.refreshTokenExpiresAt

  if (session.status === "active" && expiresAt > now) {
    return false
  }

  await db
    .update(authSessions)
    .set({
      status: "expired",
      revokedAt: new Date(),
    })
    .where(eq(authSessions.id, session.sessionId))

  return true
}

async function resolveCookieToken(kind: SessionTokenKind) {
  const cookieStore = await getCookieStore()
  const cookieName =
    kind === "access" ? env.ACCESS_TOKEN_COOKIE_NAME : env.REFRESH_TOKEN_COOKIE_NAME

  return cookieStore.get(cookieName)?.value ?? null
}

export async function getRawAccessTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization")

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7).trim() || null
  }

  return resolveCookieToken("access")
}

export async function getRawRefreshTokenFromRequest(request: Request) {
  const authorization = request.headers.get("x-refresh-token")

  if (authorization?.trim()) {
    return authorization.trim()
  }

  return resolveCookieToken("refresh")
}

export async function issueAuthSession(params: IssueSessionParams) {
  const tokens: RawSessionTokens = {
    accessToken: createRawToken(),
    refreshToken: createRawToken(),
  }

  const accessTokenExpiresAt = createAccessTokenExpirationDate()
  const refreshTokenExpiresAt = createRefreshTokenExpirationDate()

  const sessionId = await upsertSessionRecord({
    userId: params.userId,
    client: params.client,
    installationId: params.installationId ?? null,
    userAgent: params.userAgent ?? null,
    ipAddress: params.ipAddress ?? null,
    accessTokenHash: hashToken(tokens.accessToken),
    refreshTokenHash: hashToken(tokens.refreshToken),
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  })

  return {
    sessionId,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  }
}

export async function refreshAuthSession(params: {
  rawRefreshToken: string
  userAgent?: string | null
  ipAddress?: string | null
}) {
  const session = await findSessionByToken(params.rawRefreshToken, "refresh")

  if (!session) {
    return null
  }

  const expired = await markSessionExpiredIfNeeded(session, "refresh")

  if (expired) {
    return null
  }

  const accessToken = createRawToken()
  const refreshToken = createRawToken()
  const accessTokenExpiresAt = createAccessTokenExpirationDate()
  const refreshTokenExpiresAt = createRefreshTokenExpirationDate()

  await db
    .update(authSessions)
    .set({
      accessTokenHash: hashToken(accessToken),
      refreshTokenHash: hashToken(refreshToken),
      status: "active",
      userAgent: params.userAgent ?? null,
      ipAddress: params.ipAddress ?? null,
      lastUsedAt: new Date(),
      lastRefreshedAt: new Date(),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      revokedAt: null,
    })
    .where(eq(authSessions.id, session.sessionId))

  return {
    sessionId: session.sessionId,
    client: session.client,
    userId: session.userId,
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  }
}

export async function setWebSessionCookies(params: {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}) {
  const cookieStore = await getCookieStore()

  cookieStore.set(
    env.ACCESS_TOKEN_COOKIE_NAME,
    params.accessToken,
    getCookieOptions(params.accessTokenExpiresAt),
  )

  cookieStore.set(
    env.REFRESH_TOKEN_COOKIE_NAME,
    params.refreshToken,
    getCookieOptions(params.refreshTokenExpiresAt),
  )
}

export async function clearWebSessionCookies() {
  const cookieStore = await getCookieStore()

  cookieStore.set(env.ACCESS_TOKEN_COOKIE_NAME, "", {
    ...getCookieOptions(new Date(0)),
    expires: new Date(0),
  })

  cookieStore.set(env.REFRESH_TOKEN_COOKIE_NAME, "", {
    ...getCookieOptions(new Date(0)),
    expires: new Date(0),
  })
}

export async function revokeAuthSessionByAccessToken(rawAccessToken: string) {
  const session = await findSessionByToken(rawAccessToken, "access")

  if (!session) {
    return false
  }

  await db
    .update(authSessions)
    .set({
      status: "revoked",
      revokedAt: new Date(),
    })
    .where(eq(authSessions.id, session.sessionId))

  return true
}

export async function revokeAuthSessionByRefreshToken(rawRefreshToken: string) {
  const session = await findSessionByToken(rawRefreshToken, "refresh")

  if (!session) {
    return false
  }

  await db
    .update(authSessions)
    .set({
      status: "revoked",
      revokedAt: new Date(),
    })
    .where(eq(authSessions.id, session.sessionId))

  return true
}

async function revokeAuthSessionById(sessionId: string) {
  await db
    .update(authSessions)
    .set({
      status: "revoked",
      revokedAt: new Date(),
    })
    .where(eq(authSessions.id, sessionId))
}

export async function getAuthenticatedUserFromRequest(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const rawAccessToken = await getRawAccessTokenFromRequest(request)

  if (!rawAccessToken) {
    return null
  }

  const session = await findSessionByToken(rawAccessToken, "access")

  if (!session) {
    return null
  }

  const expired = await markSessionExpiredIfNeeded(session, "access")

  if (expired) {
    return null
  }

  const [record] = await db
    .select({
      sessionId: authSessions.id,
      sessionClient: authSessions.client,
      accessTokenExpiresAt: authSessions.accessTokenExpiresAt,
      refreshTokenExpiresAt: authSessions.refreshTokenExpiresAt,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(eq(authSessions.id, session.sessionId))
    .limit(1)

  if (!record) {
    return null
  }

  await expireSubscriptionsForUser(record.userId)

  const activeSubscription = await getLatestActiveSubscription(record.userId)

  if (!activeSubscription) {
    await revokeAuthSessionById(record.sessionId)
    return null
  }

  await db
    .update(authSessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(authSessions.id, record.sessionId))

  return {
    userId: record.userId,
    email: record.email,
    name: record.name,
    role: record.role,
    sessionId: record.sessionId,
    sessionClient: record.sessionClient,
    accessTokenExpiresAt: record.accessTokenExpiresAt,
    refreshTokenExpiresAt: record.refreshTokenExpiresAt,
  }
}

export async function getLatestActiveSubscription(userId: string) {
  await expireSubscriptionsForUser(userId)

  const [subscription] = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      expiresAt: subscriptions.expiresAt,
      planId: subscriptions.planId,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        isNull(subscriptions.canceledAt),
        or(isNull(subscriptions.expiresAt), gt(subscriptions.expiresAt, new Date())),
      ),
    )
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  return subscription ?? null
}

export async function buildAuthUserPayload(userId: string) {
  await expireSubscriptionsForUser(userId)

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return null
  }

  const subscription = await getLatestActiveSubscription(userId)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          expiresAt: subscription.expiresAt,
          planId: subscription.planId,
        }
      : null,
  }
}

export async function touchUserLogin(userId: string) {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId))
}

export function getRequestContext(request: Request) {
  return {
    ipAddress: getRequestIp(request),
    userAgent: request.headers.get("user-agent"),
  }
}
