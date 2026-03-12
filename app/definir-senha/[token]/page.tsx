import { getPasswordSetupTokenState } from "@/lib/auth/password-setup"

import { PasswordSetupPageWrapper } from "./password-setup-page-wrapper"

type PageProps = {
  params: Promise<{
    token: string
  }>
}

export default async function PasswordSetupPage({ params }: PageProps) {
  const { token } = await params
  const tokenState = await getPasswordSetupTokenState(token)

  return <PasswordSetupPageWrapper token={token} tokenState={tokenState} />
}
