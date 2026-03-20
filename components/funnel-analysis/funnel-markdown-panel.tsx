"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  CheckmarkCircle01Icon,
  BrainIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { cn } from "@/lib/utils"
import type { FunnelAnalysisResult } from "@/lib/funnel-analysis/types"

// ---------------------------------------------------------------------------
// Preprompts
// ---------------------------------------------------------------------------

type PromptContext = {
  rootDomain: string
  url: string
  finalUrl: string
  platform: string | null
  pageType: string | null
  language: string | null
  signals: string[]
  checkoutLinks: string[]
  externalDomains: string[]
  slugs: string[]
  ogTitle: string | null
  ogDescription: string | null
  keywords: string | null
  markdown: string
}

function ctx2text(ctx: PromptContext): string {
  const lines: string[] = []
  lines.push(`Domínio raiz: ${ctx.rootDomain}`)
  lines.push(`URL analisada: ${ctx.url}`)
  if (ctx.finalUrl !== ctx.url) lines.push(`URL final (após redirect): ${ctx.finalUrl}`)
  if (ctx.ogTitle) lines.push(`Título da página: ${ctx.ogTitle}`)
  if (ctx.ogDescription) lines.push(`Meta description: ${ctx.ogDescription}`)
  if (ctx.platform) lines.push(`Plataforma hospedeira: ${ctx.platform}`)
  if (ctx.pageType) lines.push(`Tipo de página detectado: ${ctx.pageType}`)
  if (ctx.language) lines.push(`Idioma: ${ctx.language.toUpperCase()}`)
  if (ctx.keywords) lines.push(`Keywords meta: ${ctx.keywords}`)
  if (ctx.slugs.length) lines.push(`Segmentos da URL: /${ctx.slugs.join("/")}`)
  if (ctx.checkoutLinks.length) lines.push(`Links de checkout detectados:\n${ctx.checkoutLinks.map((l) => `  - ${l}`).join("\n")}`)
  if (ctx.externalDomains.length) lines.push(`Plataformas externas vinculadas: ${ctx.externalDomains.join(", ")}`)
  if (ctx.signals.length) lines.push(`Rastreadores / pixels ativos: ${ctx.signals.join(", ")}`)
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Prompts — curados por especialistas em copy, funil e tráfego pago
// ---------------------------------------------------------------------------

const PREPROMPTS = [
  // ── 1. COPY ──────────────────────────────────────────────────────────────
  {
    id: "copy-analysis",
    label: "Análise completa de copy",
    description: "Headline, estrutura, gatilhos e melhorias acionáveis",
    build: (ctx: PromptContext) => `Você é um especialista em copywriting de resposta direta com 15 anos de experiência no mercado de infoprodutos brasileiro. Analise a copy desta página linha a linha.

## 1. Headline e Abertura
- Transcreva a headline principal e as subheadlines
- Avalie pelos 4 Us: Urgente, Único, Útil, Ultra-específico (nota 1–10 cada)
- O gancho inicial prende ou solta o leitor? Por quê?

## 2. Estrutura e Fluxo
- Identifique o framework principal (AIDA, PAS, StoryBrand, DIC, outro)
- Mapeie as seções do topo ao rodapé com os objetivos de cada uma
- A jornada emocional do leitor faz sentido? Há gaps ou saltos bruscos?

## 3. Gatilhos Mentais Detectados
Para cada gatilho encontrado, cite o trecho exato que o ativa:
- Escassez | Urgência | Autoridade | Prova social | Reciprocidade
- Especificidade | Curiosidade | Dor/medo | Desejo/aspiração | Identidade

## 4. Proposta de Valor
- O que está sendo prometido? É claro e específico?
- Qual é o GRANDE BENEFÍCIO em uma frase?
- A promessa é crível dado o nível de prova apresentado?

## 5. CTAs
- Liste todos os CTAs com a linguagem exata usada
- São claros, urgentes, específicos? Avalie cada um
- A progressão de compromisso ao longo da página faz sentido?

## 6. Diagnóstico
- 3 maiores FORÇAS desta copy
- 3 maiores FRAQUEZAS
- 5 melhorias acionáveis em ordem de impacto esperado

---
Contexto técnico:
${ctx2text(ctx)}

Conteúdo completo da página (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 2. OFERTA ────────────────────────────────────────────────────────────
  {
    id: "offer-stack",
    label: "Desconstruir a oferta",
    description: "Stack de valor, bônus, preço e garantias",
    build: (ctx: PromptContext) => `Você é um especialista em estruturação de ofertas irresistíveis para o mercado digital brasileiro. Faça uma engenharia reversa completa da oferta desta página.

## 1. Produto Principal
- Nome exato do produto/programa
- O que entrega? (resultado prometido em uma frase)
- Para quem é? (clareza do ICP declarada na copy)
- Qual é o mecanismo único — o "como" diferenciado?

## 2. Stack de Valor Completo
| Item | O que entrega | Valor declarado | Papel estratégico |
|------|--------------|-----------------|-------------------|
| Produto principal | ... | R$ ... | Core |
| [Bônus 1] | ... | R$ ... | [Reduz objeção / Aumenta desejo / Gera urgência] |

## 3. Preço e Ancoragem
- Preço(s) apresentado(s) e em quais formatos (à vista / parcelado)
- Como a ancoragem é feita? (comparação, valor total vs. preço real)
- Desconto nominal e percentual exibidos
- Há order bump ou upsell detectado?

## 4. Garantia
- Tipo e duração exata
- Linguagem usada (é empática, confiante, ou tímida?)
- Posição na página — reforça ou não reforça a decisão de compra?

## 5. Urgência e Escassez
- Qual mecanismo é usado? (timer, vagas limitadas, bônus por tempo, etc.)
- É real ou artificial? Justifique com trechos do texto
- Está posicionada de forma crível?

## 6. Diagnóstico e Oportunidades
- Nota geral do stack de valor (1–10) com justificativa
- O que adicionaria para aumentar valor percebido sem custo relevante?
- O que tiraria por estar enfraquecendo a oferta?

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 3. MECANISMO ÚNICO ───────────────────────────────────────────────────
  {
    id: "unique-mechanism",
    label: "Extrair mecanismo único",
    description: "Descobre a tese central, o método e a lógica da promessa",
    build: (ctx: PromptContext) => `Você é um especialista sênior em copy estratégica, posicionamento de oferta e engenharia reversa de páginas de vendas.

Objetivo: identificar o mecanismo único desta oferta com precisão, sem inventar nada fora do que estiver sustentado pelo conteúdo da página.

Definição operacional de mecanismo único:
- a explicação central de por que o problema existe
- o jeito específico que a página apresenta para resolver esse problema
- pode aparecer como método, protocolo, fórmula, sistema, estratégia, descoberta ou abordagem

Regras obrigatórias:
- não gere buscas Google
- não gere termos para pesquisa
- não escreva introdução, conclusão ou floreio
- não invente nomes, métricas ou promessas não sustentadas pela página
- se algo não estiver claro, escreva exatamente: não ficou claro na página
- seja objetivo, literal e específico

Sua resposta deve conter somente estes blocos, nesta ordem:

MECANISMO PRINCIPAL:
[uma única linha com o nome do mecanismo ou "não ficou claro na página"]

TESE CENTRAL:
[uma única linha explicando a ideia principal que a página quer fazer o leitor acreditar]

PROBLEMA -> CAUSA -> SOLUÇÃO:
[uma única linha neste formato: problema | causa raiz | solução proposta]

PROMESSA LIGADA AO MECANISMO:
[uma única linha curta]

EVIDÊNCIAS:
- 3 a 5 linhas no formato: "trecho exato" -> o que esse trecho prova

NÍVEL DE FORÇA:
[Genérico OU Semi-diferenciado OU Forte e proprietário]

3 VARIAÇÕES MELHORES DO MECANISMO:
~~~text
[3 linhas, uma por linha, com nomes melhores para o mesmo mecanismo]
~~~

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 4. MAPEAR OFERTAS PARECIDAS ─────────────────────────────────────────
  {
    id: "similar-offers-ai",
    label: "Mapear ofertas parecidas",
    description: "Extrai promessa, tese e gera inteligência para buscar concorrentes semelhantes",
    build: (ctx: PromptContext) => `Você é um especialista sênior em inteligência competitiva e engenharia de busca aplicada a páginas de vendas.

Objetivo: analisar esta página e gerar consultas Google curtas, úteis e prontas para copiar para encontrar ofertas de terceiros parecidas.

Regras obrigatórias:
- entregue somente os blocos finais pedidos
- não escreva introdução, conclusão, justificativa ou explicação sobre regras
- não mencione prompt, contexto, placeholder ou motivo das escolhas
- não invente concorrentes específicos
- se algo não estiver claro, escreva exatamente: não ficou claro na página

Regras do bloco BUSCAS GOOGLE:
- cada linha deve ser uma query Google completa, pronta para copiar
- nenhuma linha pode usar site: ou -site:
- use queries curtas e densas; evite frases longas e linguagem natural
- prefira 2 a 6 termos principais, além dos operadores
- use os termos mais distintivos da página
- pelo menos 5 linhas devem usar aspas curtas
- pelo menos 4 linhas devem usar inurl:
- pelo menos 2 linhas devem usar intitle:
- pelo menos 3 linhas devem usar OR
- pelo menos 5 linhas devem ter no máximo 8 palavras, sem contar operadores
- misture promessa, mecanismo, nicho, subnicho, dor e transformação
- não repita linhas

Formato da resposta:

PROMESSA CENTRAL:
[uma única linha curta]

PÚBLICO PROVÁVEL:
[uma única linha curta]

NICHO:
[uma única linha curta]

SUBNICHO:
[uma única linha curta ou "não ficou claro na página"]

MECANISMO:
[uma única linha curta ou "não ficou claro na página"]

TERMOS-BASE:
~~~text
[8 linhas curtas com os termos mais distintivos da página; uma por linha]
~~~

BUSCAS GOOGLE:
~~~text
[15 linhas com queries completas já prontas para copiar e sem usar site: ou -site:]
~~~

TOP 3 BUSCAS:
~~~text
[repita exatamente 3 linhas do bloco anterior, sem mudar nada]
~~~

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 5. PROVA SOCIAL ──────────────────────────────────────────────────────
  {
    id: "social-proof",
    label: "Extrair prova social",
    description: "Depoimentos, números, autoridade e credibilidade",
    build: (ctx: PromptContext) => `Você é um especialista em persuasão e conversão. Faça uma varredura completa nesta página e extraia TUDO que funciona como prova social e credibilidade.

## 1. Depoimentos e Cases
Transcreva cada depoimento encontrado no formato:
> "Texto exato do depoimento"
— Identificação (nome, perfil, resultado obtido)

Se não houver texto literal, descreva como a prova é apresentada.

## 2. Números e Estatísticas
Liste todos os números usados como prova (ex: "10.000 alunos", "perdeu 12kg em 30 dias", "R$ 47.000 em um mês"):
- Número: "..."
- Verificável? Específico? Apresentado de forma crível?

## 3. Autoridade e Credenciais
- Nome e perfil do produtor/criador
- Credenciais declaradas (formação, experiência, casos de sucesso pessoal)
- Menções em mídia, certificações, prêmios?
- Como a autoridade é construída ao longo da copy?

## 4. Outros Elementos de Prova
- Referências a provas visuais (antes/depois, prints, capturas de tela)
- Logos de parceiros, meios de pagamento, selos de segurança
- Número de alunos, visualizações, seguidores mencionados

## 5. Diagnóstico da Prova Social
- Nível geral: Forte / Médio / Fraco — justifique
- Qual tipo de prova tem MAIS impacto para este nicho?
- O que está faltando para tornar a prova mais convincente?

## 6. Recomendações
- Como potencializar a prova existente?
- Que tipo de prova adicional deveria ser coletada/exibida?
- Onde na página a prova está mal posicionada?

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 6. OBJEÇÕES ──────────────────────────────────────────────────────────
  {
    id: "objections-map",
    label: "Mapa de objeções",
    description: "O que impede a compra e como a copy responde",
    build: (ctx: PromptContext) => `Você é um especialista em psicologia da conversão e vendas consultivas. Analise esta página e construa o mapa completo de objeções.

## 1. Objeções Detectadas na Copy
Para cada objeção que a copy tenta resolver, identifique:

**Objeção:** "..."
**Como a copy responde:** (trecho exato ou paráfrase)
**Eficácia da resposta:** Alta / Média / Baixa — por quê?

Categorize cada uma:
- Preço ("é caro", "não tenho dinheiro")
- Ceticismo ("será que funciona?", "já tentei outras coisas")
- Adequação ("isso é para mim?")
- Tempo ("não tenho tempo")
- Autoridade ("quem é esse cara?")
- Urgência ("posso comprar depois")
- Risco ("e se não funcionar?")

## 2. Objeções NÃO Tratadas
Quais objeções comuns para esse nicho/oferta a copy ignora completamente?
Liste com o impacto esperado em conversão (Alto / Médio / Baixo)

## 3. Hierarquia das Objeções
Ordene as 5 maiores objeções do avatar por probabilidade de impedir a compra

## 4. Recomendações Acionáveis
Para cada objeção não tratada ou tratada de forma fraca:
- Onde inserir na página
- Como redigir a resposta (com exemplo de copy sugerida)

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 7. AVATAR ────────────────────────────────────────────────────────────
  {
    id: "avatar-build",
    label: "Avatar do comprador",
    description: "ICP completo extraído da linguagem da página",
    build: (ctx: PromptContext) => `Você é um especialista em psicologia do consumidor e segmentação de mercado. Com base na linguagem, nas promessas e nos gatilhos desta página, construa o perfil completo do comprador ideal (ICP / Avatar).

## 1. Perfil Demográfico
- Nome fictício e gênero predominante
- Faixa etária
- Renda mensal aproximada
- Localização (se inferível)
- Grau de instrução

## 2. Contexto de Vida
- Situação profissional atual
- Rotina típica do dia
- Maior pressão ou frustração cotidiana

## 3. Mapa de Dores (extraído da copy)
Para cada dor identificada, cite o trecho que a evidencia:
- Dor 1: "..." → trecho: "..."
- Dor 2: "..." → trecho: "..."

## 4. Desejos e Resultado Sonhado
- O que esta pessoa quer ALCANÇAR?
- Como ela imagina que sua vida será depois do resultado?
- Qual é o nível de consciência do problema?
  (Sem consciência / Ciente do problema / Busca solução / Compara soluções / Pronto para comprar)

## 5. Objeções Mais Prováveis
Liste as 5 principais razões pelas quais esta pessoa NÃO compraria agora

## 6. Perfil Digital
- Plataformas que mais usa (YouTube, Instagram, TikTok, podcasts)
- Influenciadores e criadores do nicho que provavelmente segue
- Como chegou a esta página? (tráfego frio / morno / quente)
- Qual dispositivo usa para comprar?

## 7. A Frase que Fecha a Venda
- O que esta pessoa PRECISA ouvir para apertar o botão?
- Qual é o gatilho emocional decisivo para este avatar?

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 8. SCRIPTS DE ANÚNCIO ────────────────────────────────────────────────
  {
    id: "ad-scripts",
    label: "Criar scripts de anúncio",
    description: "5 ângulos prontos para Meta, TikTok e Google",
    build: (ctx: PromptContext) => `Você é um especialista em criação de anúncios pagos para o mercado de infoprodutos brasileiro. Com base na copy desta página, crie 5 scripts de anúncio prontos para usar, cada um com um ângulo diferente.

Para cada script entregue:
- Formato recomendado
- Hook (primeiros 3 segundos — deve parar o scroll)
- Corpo do anúncio
- CTA

---

## Script 1 — Ângulo: DOR
**Formato:** Vídeo UGC ou VSL curto (30–60s) para Meta / TikTok
**Hook:** [Primeira linha que ativa a dor mais profunda do avatar]
**Corpo:**
[Script natural, sem linguagem de vendedor, 3–4 parágrafos]
**CTA:** [Direciona para a página]

---

## Script 2 — Ângulo: RESULTADO ASPIRACIONAL
**Formato:** Vídeo ou carrossel
**Hook:**
**Corpo:**
**CTA:**

---

## Script 3 — Ângulo: PROVA SOCIAL / TRANSFORMAÇÃO
**Formato:** Depoimento real ou simulado (UGC)
**Hook:**
**Corpo:**
**CTA:**

---

## Script 4 — Ângulo: CURIOSIDADE / CONTRAINTUITIVO
**Formato:** Imagem estática com headline forte + texto de anúncio
**Headline do criativo:**
**Texto do anúncio:**
**CTA:**

---

## Script 5 — Ângulo: URGÊNCIA / JANELA DE OPORTUNIDADE
**Formato:** Story ou feed vertical
**Hook:**
**Corpo:**
**CTA:**

---

Observações finais:
- Quais 2 ângulos têm maior potencial para público FRIO?
- Quais funcionam melhor para RETARGETING?

---
${ctx2text(ctx)}

Conteúdo da página para embasar os scripts:
"""
${ctx.markdown}
"""`,
  },

  // ── 9. FUNIL ─────────────────────────────────────────────────────────────
  {
    id: "funnel-map",
    label: "Mapear o funil de vendas",
    description: "Arquitetura, jornada e gaps de conversão",
    build: (ctx: PromptContext) => `Você é um especialista em arquitetura de funis de vendas digitais. Analise esta página e mapeie a lógica completa do funil.

## 1. Tipo e Papel da Página
- Qual é o papel desta página no funil? (VSL, carta de vendas longa, webinar replay, bridge page, página de captura…)
- Temperatura do público pressuposta: Frio / Morno / Quente
- Esta página funciona como destino direto de anúncio ou final de funil aquecido?

## 2. Jornada Narrativa (do topo ao rodapé)
Mapeie cada etapa da jornada emocional do visitante:
1. Gancho / Interrupção de padrão
2. Identificação e agitação do problema
3. Jornada / História de transformação
4. Apresentação da solução + mecanismo único
5. Prova e credibilidade
6. Apresentação da oferta e stack de valor
7. CTA principal + urgência / escassez

## 3. Oferta e Upsells
- Oferta principal identificada
- Sinais de order bump (compra impulsiva no checkout)
- Sinais de upsell / downsell pós-compra
- Há indicação de área de membros, grupo VIP ou suporte?

## 4. Mecanismos de Retenção
- O que impede o visitante de sair sem comprar?
- Há urgência real sustentada ao longo da página?
- Quais elementos de retargeting estão preparados (pixels, eventos)?

## 5. Diagnóstico de Conversão
- Onde o visitante provavelmente abandona? Por quê?
- Qual é o maior gap entre interesse e compra?
- O que adicionaria ou removeria para aumentar a taxa de conversão?
- Qual seria a taxa de conversão estimada para este funil (frio/morno)?

---
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },

  // ── 10. TRÁFEGO ──────────────────────────────────────────────────────────
  {
    id: "traffic-strategy",
    label: "Estratégia de tráfego",
    description: "Plataformas, segmentação e estrutura de campanha",
    build: (ctx: PromptContext) => `Você é um especialista em mídia paga com foco em infoprodutos no Brasil. Com base na oferta e copy desta página, crie uma estratégia completa de tráfego pago.

## 1. Diagnóstico Inicial
- Temperatura ideal do público para esta oferta
- Esta página suporta tráfego FRIO direto ou precisa de funil de aquecimento?
- Qual é o ticket presumido e o que isso implica para o CPL/CPA tolerável?

## 2. Plataformas Recomendadas
| Plataforma | Prioridade | Justificativa | Objetivo principal |
|------------|------------|---------------|--------------------|
| Meta Ads | | | |
| Google Ads | | | |
| TikTok Ads | | | |
| YouTube Ads | | | |
| Kwai Ads | | | |

## 3. Segmentação de Público
- Públicos de interesse (baseados no nicho identificado na copy)
- Semente ideal para Lookalike (quem seria o cliente perfeito?)
- Públicos a EVITAR (que desperdiçam budget)
- Estratégia de retargeting: em quais etapas do funil e com qual mensagem?

## 4. Direção Criativa
- Formato vencedor para esta oferta (VSL, UGC, carrossel, estático)
- Os 3 ângulos de copy mais prováveis de converter (extraídos da promessa da página)
- Tom de voz recomendado para os anúncios

## 5. Estrutura de Campanha Sugerida
- Objetivo de campanha e otimização recomendada
- Budget inicial e lógica de escala (quando duplicar, quando pausar)
- Métricas de corte: CPL/CPA máximo, CTR mínimo, ROAS alvo

## 6. Alertas e Red Flags
- O que nesta página pode causar reprovação ou restrição nos anúncios?
- Políticas específicas a monitorar (Meta, Google, TikTok)?
- Algum elemento da copy que precisa ser adaptado para anúncios?

---
${ctx2text(ctx)}

Conteúdo da página:
"""
${ctx.markdown}
"""`,
  },

  // ── 11. ESTRUTURA SIMILAR ────────────────────────────────────────────────
  {
    id: "competitor-clone",
    label: "Criar estrutura similar",
    description: "Briefing completo para replicar com outro produto",
    build: (ctx: PromptContext) => `Você é um especialista em arquitetura de landing pages e funis de alta conversão. Com base nesta página de referência, crie um briefing completo para replicar a estrutura com um produto DIFERENTE.

## 1. Skeleton da Página (Mapa de Seções)
| # | Nome da seção | Objetivo da seção | Elementos obrigatórios | Extensão sugerida |
|---|--------------|-------------------|----------------------|-------------------|

## 2. Guia de Copy
- Framework principal e por que funciona para este nicho
- Tom de voz: [5 adjetivos que descrevem o estilo]
- Padrão de headline identificado (fórmula replicável)
- Vocabulário do avatar: palavras e expressões que ressoam
- Como adaptar o gancho de abertura para outro produto

## 3. Elementos de Alta Conversão — REPLICAR
Liste os elementos que claramente contribuem para a conversão e como reproduzir cada um em uma nova página

## 4. O que NÃO Replicar
- Elementos fracos ou abaixo do padrão de mercado
- O que melhorar na versão nova

## 5. Checklist de Produção
Gere um checklist de 15–20 itens para garantir que a nova página tem tudo que precisa:
[ ] Headline com benefício específico e urgência
[ ] ...

## 6. Estimativa de Esforço
- Número de seções
- Nível de produção (básico / intermediário / avançado)
- Elementos que precisam de designer / desenvolvedor

---
Página de referência:
${ctx2text(ctx)}

Conteúdo (Markdown):
"""
${ctx.markdown}
"""`,
  },
]

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function FunnelMarkdownPanel({ result }: { result: FunnelAnalysisResult }) {
  const [selectedId, setSelectedId] = useState(PREPROMPTS[0]!.id)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">("down")
  const [copied, setCopied] = useState(false)
  const [markdownOpen, setMarkdownOpen] = useState(true)
  const selectRef = useRef<HTMLDivElement>(null)

  const markdown = result.markdown ?? ""
  const hasMarkdown = markdown.trim().length > 0

  const ctx: PromptContext = {
    rootDomain: result.rootDomain,
    url: result.initialUrl,
    finalUrl: result.finalUrl,
    platform: result.platform,
    pageType: result.pageType,
    language: result.language,
    signals: result.signals,
    checkoutLinks: result.checkoutLinks,
    externalDomains: result.externalDomains,
    slugs: result.slugs,
    ogTitle: result.ogTitle,
    ogDescription: result.ogDescription,
    keywords: result.keywords,
    markdown: markdown.slice(0, 10000),
  }

  const selected = PREPROMPTS.find((p) => p.id === selectedId) ?? PREPROMPTS[0]!

  useEffect(() => {
    if (!dropdownOpen) return

    function updateDropdownPosition() {
      const el = selectRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const availableBelow = window.innerHeight - rect.bottom - 16
      const availableAbove = rect.top - 16

      if (availableBelow < 320 && availableAbove > availableBelow) {
        setDropdownDirection("up")
      } else {
        setDropdownDirection("down")
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const el = selectRef.current
      if (!el) return
      if (!el.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false)
      }
    }

    updateDropdownPosition()
    window.addEventListener("resize", updateDropdownPosition)
    window.addEventListener("scroll", updateDropdownPosition, true)
    window.addEventListener("mousedown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("resize", updateDropdownPosition)
      window.removeEventListener("scroll", updateDropdownPosition, true)
      window.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [dropdownOpen])

  async function handleCopy() {
    await navigator.clipboard.writeText(selected.build(ctx))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">

        {/* Cabeçalho */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <HugeiconsIcon icon={BrainIcon} size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Preprompts de IA</p>
            <p className="text-xs text-muted-foreground">
              Selecione, copie e cole na sua IA favorita
            </p>
          </div>
        </div>

        {/* Select visível — label + dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground">
            Escolha o tipo de análise
          </label>

          <div ref={selectRef} className="relative">
            {/* Botão do select */}
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-md border-2 bg-background px-4 py-3 text-sm transition-colors",
                dropdownOpen
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
                  Clique aqui para escolher ou trocar
                </span>
                <span className="font-semibold text-foreground">{selected.label}</span>
                <span className="text-xs text-muted-foreground">{selected.description}</span>
              </div>
              <HugeiconsIcon
                icon={dropdownOpen ? ArrowUp01Icon : ArrowDown01Icon}
                size={18}
                className="shrink-0 text-muted-foreground"
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className={cn(
                  "absolute left-0 right-0 z-30 overflow-hidden rounded-md border border-border bg-popover shadow-2xl",
                  dropdownDirection === "down" ? "top-full mt-1.5" : "bottom-full mb-1.5",
                )}
              >
                <div className="max-h-[min(30rem,calc(100vh-8rem))] overflow-y-auto overscroll-contain py-1">
                  {PREPROMPTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(p.id)
                        setDropdownOpen(false)
                        setCopied(false)
                      }}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-accent",
                        p.id === selectedId && "border-l-2 border-l-primary bg-primary/8",
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">{p.label}</span>
                      <span className="text-xs text-muted-foreground">{p.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview do prompt gerado */}
        <div className="rounded-md border border-border bg-muted/30">
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Preview do prompt
            </p>
          </div>
          <div className="relative max-h-32 overflow-hidden p-3">
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
              {selected.build(ctx).slice(0, 400)}
            </p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-muted/60 to-transparent" />
          </div>
        </div>

        {/* Botão copiar */}
        <Button
          onClick={handleCopy}
          className={cn(
            "w-full gap-2 transition-all",
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
              : "",
          )}
          variant={copied ? "outline" : "default"}
          size="lg"
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
            size={16}
          />
          {copied ? "Prompt copiado!" : "Copiar prompt"}
        </Button>

        {/* Conteúdo Markdown extraído */}
        {hasMarkdown && (
          <div className="border-t border-border/50 pt-4">
            <button
              type="button"
              onClick={() => setMarkdownOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 text-left transition-colors hover:opacity-80"
            >
              <span className="text-sm font-semibold text-foreground">
                Conteúdo extraído da página
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {Math.round(markdown.length / 1000)}k chars
                </span>
                <HugeiconsIcon
                  icon={markdownOpen ? ArrowUp01Icon : ArrowDown01Icon}
                  size={14}
                  className="text-muted-foreground"
                />
              </span>
            </button>

            {markdownOpen && (
              <div className="mt-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                <div className="max-h-[500px] overflow-y-auto p-5">
                  <MarkdownRenderer content={markdown} />
                </div>
              </div>
            )}
          </div>
        )}

        {!hasMarkdown && (
          <p className="text-xs text-muted-foreground/50">
            Nenhum conteúdo Markdown foi extraído desta página.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
