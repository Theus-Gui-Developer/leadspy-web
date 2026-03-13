import { redirect } from "next/navigation"

import { getMe } from "@/lib/api/get_me"
import { SavedAdsPage } from "@/components/saved-ads/saved-ads-page"

export default async function AnunciosPage() {
  const result = await getMe()

  if (!result.ok) {
    redirect("/login")
  }

  return <SavedAdsPage />
}
