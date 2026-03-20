import { redirect } from "next/navigation"

import { getMe } from "@/lib/api/get_me"
import { FunnelAnalysisPage } from "@/components/funnel-analysis/funnel-analysis-page"

export default async function AnaliseFunilDePaginaPage() {
  const result = await getMe()

  if (!result.ok) {
    redirect("/login")
  }

  return <FunnelAnalysisPage />
}
