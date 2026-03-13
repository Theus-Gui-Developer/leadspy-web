import "server-only"

import { randomBytes } from "node:crypto"

import { and, count, desc, eq, ilike, isNull, or, sql, asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { savedAds, savedAdFolders, users } from "@/lib/db/schema"

type CreateSavedAdInput = {
  userId: string
  adId: string
  libraryUrl?: string | null
  advertiserName?: string | null
  advertiserLink?: string | null
  pageId?: string | null
  adText?: string | null
  siteUrl?: string | null
  domain?: string | null
  mediaType?: string | null
  thumbnailUrl?: string | null
  folderId?: string | null
  metadata?: Record<string, unknown> | null
}

type ListSavedAdsInput = {
  userId: string
  folderId?: string | null
  search?: string | null
  domain?: string | null
  mediaType?: string | null
  page?: number
  limit?: number
  sort?: string | null
}

export async function createSavedAd(input: CreateSavedAdInput) {
  const existing = await db
    .select({ id: savedAds.id })
    .from(savedAds)
    .where(and(eq(savedAds.userId, input.userId), eq(savedAds.adId, input.adId)))
    .limit(1)

  if (existing.length > 0) {
    return { ok: false as const, duplicate: true, existingSavedAdId: existing[0].id }
  }

  const [inserted] = await db
    .insert(savedAds)
    .values({
      userId: input.userId,
      folderId: input.folderId || null,
      adId: input.adId,
      libraryUrl: input.libraryUrl || null,
      advertiserName: input.advertiserName || null,
      advertiserLink: input.advertiserLink || null,
      pageId: input.pageId || null,
      adText: input.adText || null,
      siteUrl: input.siteUrl || null,
      domain: input.domain || null,
      mediaType: input.mediaType || "unknown",
      thumbnailUrl: input.thumbnailUrl || null,
      metadata: input.metadata || null,
    })
    .returning({
      id: savedAds.id,
      adId: savedAds.adId,
      folderId: savedAds.folderId,
      savedAt: savedAds.savedAt,
    })

  return { ok: true as const, savedAd: inserted }
}

export async function listSavedAds(input: ListSavedAdsInput) {
  const page = Math.max(1, input.page || 1)
  const limit = Math.min(50, Math.max(1, input.limit || 20))
  const offset = (page - 1) * limit

  const conditions = [eq(savedAds.userId, input.userId)]

  if (input.folderId === "none") {
    conditions.push(isNull(savedAds.folderId))
  } else if (input.folderId) {
    conditions.push(eq(savedAds.folderId, input.folderId))
  }

  if (input.search) {
    const term = `%${input.search}%`
    conditions.push(
      or(
        ilike(savedAds.adText, term),
        ilike(savedAds.advertiserName, term),
        ilike(savedAds.domain, term),
      )!,
    )
  }

  if (input.domain) {
    conditions.push(eq(savedAds.domain, input.domain))
  }

  if (input.mediaType) {
    conditions.push(eq(savedAds.mediaType, input.mediaType))
  }

  const where = and(...conditions)

  let orderBy
  switch (input.sort) {
    case "savedAt:asc":
      orderBy = asc(savedAds.savedAt)
      break
    case "advertiser:asc":
      orderBy = asc(savedAds.advertiserName)
      break
    case "advertiser:desc":
      orderBy = desc(savedAds.advertiserName)
      break
    case "domain:asc":
      orderBy = asc(savedAds.domain)
      break
    case "domain:desc":
      orderBy = desc(savedAds.domain)
      break
    default:
      orderBy = desc(savedAds.savedAt)
  }

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(savedAds)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(savedAds)
      .where(where),
  ])

  const total = totalResult[0]?.total ?? 0

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function deleteSavedAd(userId: string, savedAdId: string) {
  const result = await db
    .delete(savedAds)
    .where(and(eq(savedAds.id, savedAdId), eq(savedAds.userId, userId)))
    .returning({ id: savedAds.id })

  return result.length > 0
}

export async function moveSavedAd(
  userId: string,
  savedAdId: string,
  folderId: string | null,
) {
  if (folderId) {
    const folder = await db
      .select({ id: savedAdFolders.id })
      .from(savedAdFolders)
      .where(
        and(eq(savedAdFolders.id, folderId), eq(savedAdFolders.userId, userId)),
      )
      .limit(1)

    if (folder.length === 0) {
      return { ok: false as const, message: "Pasta nao encontrada." }
    }
  }

  const [updated] = await db
    .update(savedAds)
    .set({ folderId: folderId || null, updatedAt: new Date() })
    .where(and(eq(savedAds.id, savedAdId), eq(savedAds.userId, userId)))
    .returning({
      id: savedAds.id,
      folderId: savedAds.folderId,
    })

  if (!updated) {
    return { ok: false as const, message: "Anuncio salvo nao encontrado." }
  }

  return { ok: true as const, savedAd: updated }
}

export async function getSavedAdById(userId: string, savedAdId: string) {
  const [ad] = await db
    .select()
    .from(savedAds)
    .where(and(eq(savedAds.id, savedAdId), eq(savedAds.userId, userId)))
    .limit(1)

  return ad || null
}

export async function generateShareToken(
  userId: string,
  savedAdId: string,
) {
  const ad = await getSavedAdById(userId, savedAdId)

  if (!ad) {
    return { ok: false as const, message: "Anuncio salvo nao encontrado." }
  }

  if (ad.shareToken) {
    return { ok: true as const, shareToken: ad.shareToken }
  }

  const token = randomBytes(16).toString("hex")

  const [updated] = await db
    .update(savedAds)
    .set({ shareToken: token, updatedAt: new Date() })
    .where(and(eq(savedAds.id, savedAdId), eq(savedAds.userId, userId)))
    .returning({ shareToken: savedAds.shareToken })

  return { ok: true as const, shareToken: updated.shareToken! }
}

export async function getSharedAd(shareToken: string) {
  const [ad] = await db
    .select({
      id: savedAds.id,
      adId: savedAds.adId,
      libraryUrl: savedAds.libraryUrl,
      advertiserName: savedAds.advertiserName,
      advertiserLink: savedAds.advertiserLink,
      pageId: savedAds.pageId,
      adText: savedAds.adText,
      siteUrl: savedAds.siteUrl,
      domain: savedAds.domain,
      mediaType: savedAds.mediaType,
      thumbnailUrl: savedAds.thumbnailUrl,
      metadata: savedAds.metadata,
      userId: savedAds.userId,
      userName: users.name,
    })
    .from(savedAds)
    .innerJoin(users, eq(savedAds.userId, users.id))
    .where(eq(savedAds.shareToken, shareToken))
    .limit(1)

  return ad || null
}

export async function saveSharedAdToAccount(
  shareToken: string,
  targetUserId: string,
) {
  const sharedAd = await getSharedAd(shareToken)

  if (!sharedAd) {
    return { ok: false as const, message: "Anuncio compartilhado nao encontrado." }
  }

  return createSavedAd({
    userId: targetUserId,
    adId: sharedAd.adId,
    libraryUrl: sharedAd.libraryUrl,
    advertiserName: sharedAd.advertiserName,
    advertiserLink: sharedAd.advertiserLink,
    pageId: sharedAd.pageId,
    adText: sharedAd.adText,
    siteUrl: sharedAd.siteUrl,
    domain: sharedAd.domain,
    mediaType: sharedAd.mediaType,
    thumbnailUrl: sharedAd.thumbnailUrl,
    metadata: sharedAd.metadata,
  })
}
