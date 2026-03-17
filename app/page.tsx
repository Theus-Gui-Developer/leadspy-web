import { redirect } from "next/navigation"
import { getMe } from "@/lib/api/get_me"

export default async function Page() {
  const result = await getMe()
  redirect(result.ok ? "/dashboard" : "/login")
}
