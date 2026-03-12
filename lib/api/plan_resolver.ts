/**
 * Resolve metadados de exibição de um plano a partir do seu ID.
 *
 * Como não existe uma rota GET /api/plans no backend ainda,
 * este mapeamento é baseado nos IDs conhecidos.
 * Futuramente pode ser substituído por uma chamada real.
 */

type PlanMeta = {
  name: string
  slug: string
  durationMonths: number
}

const KNOWN_PLANS: Record<string, PlanMeta> = {
  // Adicione aqui os IDs reais dos planos conforme forem criados no banco
}

const FALLBACK_PLAN: PlanMeta = {
  name: "Pro",
  slug: "pro",
  durationMonths: 1,
}

/**
 * Retorna metadados de exibição do plano pelo seu ID.
 * Caso o ID não seja reconhecido, retorna o plano padrão "Pro".
 */
export function resolvePlanFromId(planId: string): PlanMeta {
  return KNOWN_PLANS[planId] ?? FALLBACK_PLAN
}
