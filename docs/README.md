# BugSpy Web Docs

Este diretorio passa a ser a documentacao viva do backend e da aplicacao `./web/`.

Regra de trabalho:
- Toda mudanca relevante de arquitetura, modelagem, auth, billing, webhook ou onboarding deve atualizar este arquivo.
- Se surgirem fluxos grandes o suficiente, eles podem ganhar arquivos proprios dentro de `./web/docs/`.

## Visao geral

O projeto `./web/` concentra:
- backend da aplicacao
- dashboard web em Next.js
- integracao com billing
- onboarding de usuarios
- futuramente auth da extensao

Stack atual:
- Next.js (App Router)
- PostgreSQL
- Drizzle ORM + Drizzle Kit
- `postgres` como driver
- Resend para envio de email
- React Email para template de email

Importante:
- Ainda nao rodamos migrations.
- O schema esta modelado, mas a aplicacao ainda precisa da primeira migracao manual.
- O endpoint da PerfectPay foi desenhado para sempre responder `200` no nivel da aplicacao.

## Estrutura atual do backend

Arquivos principais ja criados:
- `./web/drizzle.config.ts`
- `./web/lib/db/index.ts`
- `./web/lib/db/schema/`
- `./web/lib/billing/perfect-pay.ts`
- `./web/lib/auth/password-setup.ts`
- `./web/lib/auth/session.ts`
- `./web/lib/email/resend.ts`
- `./web/app/api/billing/webhooks/perfect-pay/route.ts`
- `./web/app/api/auth/login/route.ts`
- `./web/app/api/auth/logout/route.ts`
- `./web/app/api/auth/refresh/route.ts`
- `./web/app/api/auth/me/route.ts`
- `./web/app/api/auth/password-setup/route.ts`
- `./web/app/definir-senha/[token]/page.tsx`
- `./web/seeds/seed.mjs`

## Modelagem atual do banco

### Tabelas principais

`users`
- usuario da plataforma
- campos principais: `name`, `email`, `passwordHash`, `role`

`plans`
- catalogo interno de planos
- cada plano pode ser vinculado a um provider externo
- hoje o foco e `perfectpay`
- validacao principal pelo campo `externalCode`, que corresponde ao `plan.code` recebido no webhook
- `durationMonths` define a validade do acesso, por exemplo `6` ou `12`

`subscriptions`
- representa a assinatura/acesso comprado
- guarda o email do comprador mesmo quando o usuario ainda nao existe
- mantem vinculo opcional com `users`
- campos relevantes da PerfectPay: `perfectPaySaleCode`, `perfectPaySubscriptionId`, `perfectPayProductId`, `perfectPayPlanCode`, `perfectPayRawStatus`
- quando `expiresAt < now`, a regra interna do backend converte assinaturas `active` em `expired`

`webhook_provider_tokens`
- guarda tokens de webhook por provedor
- hoje usado para validar o `token` enviado pela PerfectPay
- o token nao e salvo em texto puro; a ideia e persistir hash

`perfectpay_webhook_events`
- trilha de tudo que chegou pelo webhook
- guarda payload bruto, hash do payload, status de processamento, `saleCode`, `subscriptionCode` e `webhookOwner`
- serve para auditoria, idempotencia e debug

`webhook_logs`
- log bruto de entregas de webhook
- guarda o body original completo, headers, hash do payload, token mascarado e campos basicos de identificacao
- o objetivo e preservar tudo que chegou sem depender do sucesso do processamento principal
- a gravacao e best effort, sem bloquear o fluxo normal do webhook

`password_setup_tokens`
- tokens de onboarding para definir senha
- usados quando chega uma compra aprovada para um email que ainda nao possui conta
- guarda expiracao, uso, revogacao e vinculo opcional com assinatura/usuario

`auth_sessions`
- sessoes autenticadas para web e extensao
- guarda `access token` e `refresh token` em formato hash, tipo de cliente, expiracao e metadados da sessao
- existe no maximo uma sessao `web` e uma sessao `extension` por usuario
- a segregacao e feita no banco por `userId + client`
- usado por `login`, `refresh`, `logout` e `me`

`audit_logs`
- reservado para auditoria administrativa/sistema

## Fluxo atual da PerfectPay

Endpoint:
- `POST /api/billing/webhooks/perfect-pay`

Comportamento atual:
1. recebe JSON em objeto unico ou array
2. tenta normalizar os campos mais relevantes do payload
3. valida o `token` recebido comparando com `webhook_provider_tokens`
4. tenta registrar o payload bruto em `webhook_logs` sem bloquear o fluxo
5. identifica o plano pelo `plan.code`
6. registra o evento em `perfectpay_webhook_events`
7. cria ou atualiza `subscriptions`
8. se a compra estiver ativa e ainda nao existir usuario para o email, gera token de onboarding e tenta enviar email de acesso
9. responde `200`

Mapeamento atual de status:
- `approved`, `authorized`, `completed` -> `active`
- `refunded` -> `refunded`
- `charged_back` -> `chargeback`
- demais casos -> `pending`

Regra de negocio atual:
- o webhook da PerfectPay e tratado principalmente como entrada de `aprovacao` ou `reembolso`
- a expiracao natural do acesso nao depende do webhook; ela e definida internamente pelo sistema com base no `plan.code` mapeado em `plans.durationMonths`
- reembolso deve cancelar o acesso imediatamente

Regra interna de expiracao:
- o backend verifica `subscriptions.expiresAt` nos fluxos de autenticacao
- se uma assinatura `active` estiver com `expiresAt < now`, ela e marcada como `expired`
- dashboard e extensao passam a perder acesso automaticamente quando a assinatura vence

Observacao importante:
- A rota sempre responde `200` no codigo da aplicacao.
- Isso reduz o risco de a PerfectPay desativar o webhook por respostas nao-200.
- Ainda assim, erros de infra fora da app (timeout, 502, crash, deploy) continuam sendo risco operacional.

## Fluxo atual de onboarding por email

Quando uma compra ativa chega para um email sem usuario:
1. o webhook cria/atualiza a `subscription`
2. gera um token em `password_setup_tokens`
3. envia um email com link para definir senha
4. o link aponta para `./web/app/definir-senha/[token]/page.tsx`
5. o usuario define nome e senha
6. a API cria ou atualiza `users`
7. assinaturas do mesmo email passam a apontar para esse usuario
8. tokens antigos pendentes do mesmo email sao revogados

## Fluxo atual de autenticacao

Rotas existentes:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/password-setup`

Comportamento atual:
- `login` aceita `email`, `password`, `client` e opcionalmente `installationId`
- `client` pode ser `web` ou `extension`
- para `web`, a API cria `access token` + `refresh token` e grava ambos em cookie `httpOnly`
- para `extension`, a API retorna `access token` + `refresh token` no JSON
- `refresh` rotaciona os dois tokens e mantem a regra de uma sessao por cliente
- `me` aceita cookie da web ou `Authorization: Bearer <access token>`
- `logout` revoga a sessao atual e limpa os cookies da web
- login so e permitido quando o usuario possui assinatura ativa
- `refresh` e `me` tambem exigem assinatura ativa; se a assinatura venceu, a sessao perde acesso

Regra de sessao atual:
- cada usuario pode ter no maximo `1` sessao `web`
- cada usuario pode ter no maximo `1` sessao `extension`
- um novo login do mesmo tipo substitui a sessao anterior daquele tipo

## Envio de email

Servico escolhido:
- Resend

Uso atual:
- client server-side em `./web/lib/email/resend.ts`
- template React Email em `./web/emails/password-setup-email.tsx`

Email enviado hoje:
- assunto: `Defina sua senha de acesso ao BugSpy`
- objetivo: concluir criacao da conta apos compra validada

## Variaveis de ambiente atuais

Definidas em `./web/.env.example`:
- `DATABASE_URL`
- `SESSION_SECRET`
- `ACCESS_TOKEN_COOKIE_NAME`
- `REFRESH_TOKEN_COOKIE_NAME`
- `APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `PASSWORD_SETUP_TOKEN_TTL_HOURS`
- `AUTH_ACCESS_TOKEN_TTL_MINUTES`
- `AUTH_REFRESH_TOKEN_TTL_DAYS`
- `SEED_ADMIN_PASSWORD`
- `PERFECTPAY_WEBHOOK_TOKEN`
- `PERFECTPAY_WEBHOOK_OWNER_CODE`
- `PERFECTPAY_WEBHOOK_LABEL`

Observacoes:
- hoje a validacao do webhook nao usa um segredo fixo em env
- a validacao principal da PerfectPay esta baseada no token recebido e salvo no banco

## O que ainda falta

Prioridades de backend:
1. gerar e aplicar a primeira migration manualmente
2. criar CRUD/admin de `plans`
3. criar CRUD/admin de `webhook_provider_tokens`
4. criar middleware/protecao das rotas autenticadas do dashboard
5. criar reset/reenvio de senha
6. ligar a extensao ao backend usando `login` + `refresh`
7. revisar politicas de retencao e limpeza de `webhook_logs`

## Seeds iniciais

Agora existe a pasta `./web/seeds/` com seeds manuais separadas por responsabilidade.

Arquivos principais:
- `./web/seeds/create_user_seed.ts` - cria ou atualiza um usuario especifico
- `./web/seeds/create_plan_seed.ts` - cria ou atualiza o plano interno `developer`
- `./web/seeds/assign_plan_to_user_seed.ts` - vincula um plano a um usuario
- `./web/seeds/_shared.ts` - utilitarios compartilhados das seeds

Cada arquivo possui um objeto no topo para voce editar os dados antes de rodar.

Execucao manual por caminho com `tsx`:

```bash
npx tsx ./seeds/create_user_seed.ts
npx tsx ./seeds/create_plan_seed.ts
npx tsx ./seeds/assign_plan_to_user_seed.ts
```

Observacoes:
- nao ha problema em usar `.ts` para seeds se voce for executa-las com `tsx`
- os arquivos antigos `.mjs` podem ser tratados como legado e substituidos gradualmente por essas seeds novas

Pontos de atencao:
- decidir estrategia de reenvio de email quando o token expirar
- decidir estrategia de reset de senha depois que o usuario ja existir
- decidir se o webhook deve enfileirar processamento no futuro
- revisar expiracao/renovacao de `subscriptions` para cenarios recorrentes mais complexos

## Como atualizar esta documentacao

Sempre que houver mudanca relevante, atualizar pelo menos estes blocos:
- visao geral do fluxo
- tabelas afetadas
- endpoint novo ou alterado
- variaveis de ambiente novas
- proximo passo real do projeto

Ultima atualizacao desta documentacao:
- 2026-03-11
