import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSharedAd } from "@/lib/saved-ads/service"
import { SharedAdPreview } from "@/components/shared-ads/shared-ad-preview"

type PageProps = {
  params: Promise<{ shareToken: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareToken } = await params

  if (!shareToken || shareToken.length !== 32) {
    return { title: "Anúncio não encontrado" }
  }

  const ad = await getSharedAd(shareToken)

  if (!ad) {
    return { title: "Anúncio não encontrado" }
  }

  const title = ad.advertiserName
    ? `Anúncio de ${ad.advertiserName}`
    : "Anúncio compartilhado"

  return {
    title,
    description: ad.adText?.slice(0, 160) ?? "Veja este anúncio compartilhado no LeadSpy.",
    openGraph: {
      title: `${title} — LeadSpy`,
      description: ad.adText?.slice(0, 160) ?? "Veja este anúncio compartilhado no LeadSpy.",
      ...(ad.thumbnailUrl ? { images: [{ url: ad.thumbnailUrl }] } : {}),
    },
  }
}

export default async function SharedAdPage({ params }: PageProps) {
  const { shareToken } = await params

  if (!shareToken || shareToken.length !== 32) {
    notFound()
  }

  const ad = await getSharedAd(shareToken)

  if (!ad) {
    notFound()
  }

  return (
    <SharedAdPreview
      ad={{
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
      }}
      shareToken={shareToken}
    />
  )
}
