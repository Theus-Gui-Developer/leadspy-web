import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { createSavedAd, listSavedAds } from "@/lib/saved-ads/service"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(request: Request) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }

  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    return NextResponse.json(
      { ok: false, message: "Payload JSON invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, message: "Payload invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  const { adId, libraryUrl, advertiserName, advertiserLink, pageId, adText, siteUrl, domain, mediaType, thumbnailUrl, folderId, metadata } = payload as Record<string, unknown>

  if (typeof adId !== "string" || adId.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "adId e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }

  const result = await createSavedAd({
    userId: authenticatedUser.userId,
    adId: adId.trim(),
    libraryUrl: typeof libraryUrl === "string" ? libraryUrl : null,
    advertiserName: typeof advertiserName === "string" ? advertiserName : null,
    advertiserLink: typeof advertiserLink === "string" ? advertiserLink : null,
    pageId: typeof pageId === "string" ? pageId : null,
    adText: typeof adText === "string" ? adText : null,
    siteUrl: typeof siteUrl === "string" ? siteUrl : null,
    domain: typeof domain === "string" ? domain : null,
    mediaType: typeof mediaType === "string" ? mediaType : null,
    thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : null,
    folderId: typeof folderId === "string" ? folderId : null,
    metadata: metadata && typeof metadata === "object" ? metadata as Record<string, unknown> : null,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Anuncio ja salvo.",
        existingSavedAdId: result.existingSavedAdId,
      },
      { status: 409, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true, savedAd: result.savedAd },
    { status: 201, headers: corsHeaders },
  )
}

export async function GET(request: Request) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }

  const { searchParams } = new URL(request.url)

  const result = await listSavedAds({
    userId: authenticatedUser.userId,
    folderId: searchParams.get("folderId"),
    search: searchParams.get("search"),
    domain: searchParams.get("domain"),
    mediaType: searchParams.get("mediaType"),
    page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : 20,
    sort: searchParams.get("sort"),
  })

  return NextResponse.json(
    { ok: true, ...result },
    { status: 200, headers: corsHeaders },
  )
}
