import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type PasswordSetupEmailProps = {
  actionUrl: string
  customerName?: string | null
  expiresInHours: number
}

export function PasswordSetupEmail({
  actionUrl,
  customerName,
  expiresInHours,
}: PasswordSetupEmailProps) {
  const firstName = customerName?.trim().split(" ")[0]

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu acesso ao LeadSpy esta pronto</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Text style={eyebrow}>LeadSpy</Text>
            <Heading style={heading}>
              {firstName ? `Ola, ${firstName}` : "Ola"}
            </Heading>
            <Text style={paragraph}>
              Recebemos a confirmacao da sua compra. Para ativar seu acesso, defina
              agora a senha da sua conta.
            </Text>
            <Button href={actionUrl} style={button}>
              Definir senha
            </Button>
            <Text style={paragraph}>
              Este link expira em {expiresInHours} horas. Se o botao nao funcionar,
              copie e cole a URL abaixo no navegador:
            </Text>
            <Text style={linkText}>{actionUrl}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: "#f5f7fb",
  fontFamily: "Arial, sans-serif",
  margin: "0",
  padding: "24px 0",
}

const container = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "0 16px",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #dde4f0",
  padding: "32px",
}

const eyebrow = {
  color: "#335cff",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1.2px",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
}

const heading = {
  color: "#101828",
  fontSize: "28px",
  lineHeight: "34px",
  margin: "0 0 16px",
}

const paragraph = {
  color: "#475467",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
}

const button = {
  backgroundColor: "#335cff",
  borderRadius: "10px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "700",
  margin: "8px 0 20px",
  padding: "14px 22px",
  textDecoration: "none",
}

const linkText = {
  color: "#335cff",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
  wordBreak: "break-all" as const,
}
