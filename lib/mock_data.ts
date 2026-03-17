/**
 * ATENÇÃO: Este arquivo contém dados mockados para desenvolvimento.
 * Substitua pelas chamadas reais de API quando o backend estiver integrado.
 */

export const mockUser = {
  id: "user_01jxmock0000000000000001",
  name: "Matheus Oliveira",
  email: "matheus@leadspy.app",
  role: "admin" as const,
  avatarUrl: null as string | null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

export const mockSession = {
  client: {
    id: "client_01jxmock0000000000000001",
    userId: mockUser.id,
  },
  accessToken: "mock_access_token_dev_only",
  accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 min
  refreshToken: "mock_refresh_token_dev_only",
  refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
}

export const mockPlan = {
  id: "plan_01jxmock0000000000000001",
  slug: "pro-monthly",
  name: "Pro",
  durationMonths: 1,
  priceInCents: 9700,
  currency: "BRL",
  features: [
    "Acesso ilimitado aos anúncios",
    "Filtros avançados",
    "Exportação de relatórios",
    "Suporte prioritário",
  ],
}

export const mockSubscription = {
  id: "sub_01jxmock0000000000000001",
  userId: mockUser.id,
  planId: mockPlan.id,
  status: "active" as
    | "active"
    | "expired"
    | "cancelled"
    | "pending"
    | "refunded"
    | "chargeback",
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25), // 25 dias
  createdAt: new Date("2026-06-01T00:00:00Z"),
  renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
}
