import "server-only"

import { and, asc, count, eq, isNull, max, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { savedAdFolders, savedAds } from "@/lib/db/schema"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120)
}

export async function listFolders(userId: string) {
  const folders = await db
    .select({
      id: savedAdFolders.id,
      name: savedAdFolders.name,
      slug: savedAdFolders.slug,
      position: savedAdFolders.position,
      createdAt: savedAdFolders.createdAt,
    })
    .from(savedAdFolders)
    .where(eq(savedAdFolders.userId, userId))
    .orderBy(asc(savedAdFolders.position), asc(savedAdFolders.createdAt))

  // Contagem de anúncios por pasta em uma única query agregada
  const folderCounts = await db
    .select({
      folderId: savedAds.folderId,
      count: count(),
    })
    .from(savedAds)
    .where(eq(savedAds.userId, userId))
    .groupBy(savedAds.folderId)

  const countsMap: Record<string, number> = {}
  let noFolderCount = 0
  let totalCount = 0

  for (const row of folderCounts) {
    totalCount += row.count
    if (row.folderId === null) {
      noFolderCount = row.count
    } else {
      countsMap[row.folderId] = row.count
    }
  }

  return {
    folders: folders.map((f) => ({
      ...f,
      adCount: countsMap[f.id] ?? 0,
    })),
    noFolderCount,
    totalCount,
  }
}

export async function createFolder(userId: string, name: string) {
  const trimmedName = name.trim()

  if (!trimmedName || trimmedName.length > 120) {
    return { ok: false as const, message: "Nome da pasta invalido." }
  }

  const slug = slugify(trimmedName)

  if (!slug) {
    return { ok: false as const, message: "Nome da pasta invalido." }
  }

  const existing = await db
    .select({ id: savedAdFolders.id })
    .from(savedAdFolders)
    .where(
      and(eq(savedAdFolders.userId, userId), eq(savedAdFolders.slug, slug)),
    )
    .limit(1)

  if (existing.length > 0) {
    return {
      ok: false as const,
      message: "Ja existe uma pasta com esse nome.",
    }
  }

  const [maxPos] = await db
    .select({
      maxPosition: max(savedAdFolders.position),
    })
    .from(savedAdFolders)
    .where(eq(savedAdFolders.userId, userId))

  const [folder] = await db
    .insert(savedAdFolders)
    .values({
      userId,
      name: trimmedName,
      slug,
      position: (maxPos?.maxPosition ?? -1) + 1,
    })
    .returning()

  return { ok: true as const, folder }
}

export async function updateFolder(
  userId: string,
  folderId: string,
  name: string,
) {
  const trimmedName = name.trim()

  if (!trimmedName || trimmedName.length > 120) {
    return { ok: false as const, message: "Nome da pasta invalido." }
  }

  const slug = slugify(trimmedName)

  if (!slug) {
    return { ok: false as const, message: "Nome da pasta invalido." }
  }

  const existing = await db
    .select({ id: savedAdFolders.id })
    .from(savedAdFolders)
    .where(
      and(
        eq(savedAdFolders.userId, userId),
        eq(savedAdFolders.slug, slug),
      ),
    )
    .limit(1)

  if (existing.length > 0 && existing[0].id !== folderId) {
    return {
      ok: false as const,
      message: "Ja existe uma pasta com esse nome.",
    }
  }

  const [updated] = await db
    .update(savedAdFolders)
    .set({ name: trimmedName, slug, updatedAt: new Date() })
    .where(
      and(
        eq(savedAdFolders.id, folderId),
        eq(savedAdFolders.userId, userId),
      ),
    )
    .returning()

  if (!updated) {
    return { ok: false as const, message: "Pasta nao encontrada." }
  }

  return { ok: true as const, folder: updated }
}

export async function deleteFolder(userId: string, folderId: string) {
  await db
    .update(savedAds)
    .set({ folderId: null, updatedAt: new Date() })
    .where(and(eq(savedAds.userId, userId), eq(savedAds.folderId, folderId)))

  const result = await db
    .delete(savedAdFolders)
    .where(
      and(
        eq(savedAdFolders.id, folderId),
        eq(savedAdFolders.userId, userId),
      ),
    )
    .returning({ id: savedAdFolders.id })

  return result.length > 0
}

export async function reorderFolders(userId: string, folderIds: string[]) {
  await db.transaction(async (tx) => {
    for (let i = 0; i < folderIds.length; i++) {
      await tx
        .update(savedAdFolders)
        .set({ position: i, updatedAt: new Date() })
        .where(
          and(
            eq(savedAdFolders.id, folderIds[i]),
            eq(savedAdFolders.userId, userId),
          ),
        )
    }
  })

  return { ok: true as const }
}
