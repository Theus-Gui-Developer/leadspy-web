import { NextResponse } from "next/server"

import { getSharedAd } from "@/lib/saved-ads/service"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const { shareToken } = await params

  if (!shareToken || shareToken.length !== 32) {
    return NextResponse.json(
      { ok: false, message: "Link invalido." },
      { status: 400 },
    )
  }

  const ad = await getSharedAd(shareToken)

  if (!ad) {
    return NextResponse.json(
      { ok: false, message: "Anuncio nao encontrado." },
      { status: 404 },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      ad: {
        adId: ad.adId,
        libraryUrl: ad.libraryUrl,
        advertiserName: ad.advertiserName,
        advertiserLink: ad.advertiserLink,
        pageId: ad.pageId,
        adText: ad.adText,
        siteUrl: ad.siteUrl,
        domain: ad.domain,
        mediaType: ad.mediaType,
        thumbnailUrl: ad.thumbnailUrl,
        sharedBy: ad.userName,
      },
    },
    { status: 200 },
  )
}
