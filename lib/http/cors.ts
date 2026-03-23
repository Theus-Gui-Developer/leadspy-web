const ALLOWED_METHODS = "GET, POST, OPTIONS"
const ALLOWED_HEADERS = "Content-Type, Authorization, x-refresh-token"

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) {
    return false
  }

  if (origin.startsWith("chrome-extension://")) {
    return true
  }

  if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") {
    return true
  }

  if (origin === "https://app.leadspy.com.br") {
    return true
  }

  if (origin === "https://app.adsniper.com.br") {
    return true
  }

  return false
}

export function buildCorsHeaders(request: Request) {
  const origin = request.headers.get("origin")

  if (!isAllowedOrigin(origin)) {
    return {} as Record<string, string>
  }

  const allowedOrigin = origin

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    Vary: "Origin",
  } satisfies Record<string, string>
}

export function buildOptionsCorsResponse(request: Request) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  })
}
