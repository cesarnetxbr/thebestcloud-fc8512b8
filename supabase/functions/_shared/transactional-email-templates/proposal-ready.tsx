/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'The Best Cloud'

interface ProposalReadyProps {
  customerName?: string
  dealTitle?: string
  proposalUrl?: string
  trackingUrl?: string
  bookingUrl?: string
}

const ProposalReadyEmail = ({
  customerName,
  dealTitle,
  proposalUrl,
  trackingUrl,
  bookingUrl,
}: ProposalReadyProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Sua proposta personalizada da {SITE_NAME} está pronta</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {customerName ? `Olá, ${customerName}!` : 'Olá!'}
        </Heading>
        <Text style={text}>
          Preparamos uma proposta comercial personalizada
          {dealTitle ? ` para "${dealTitle}"` : ''} com base nas suas necessidades.
        </Text>

        {proposalUrl ? (
          <Section style={btnSection}>
            <Button style={primaryBtn} href={proposalUrl}>
              Baixar proposta em PDF
            </Button>
          </Section>
        ) : null}

        <Hr style={hr} />

        <Text style={text}>
          Acompanhe o andamento da sua cotação ou agende uma conversa com um
          especialista:
        </Text>

        {trackingUrl ? (
          <Text style={linkLine}>
            • <a href={trackingUrl} style={link}>Acompanhar minha cotação</a>
          </Text>
        ) : null}
        {bookingUrl ? (
          <Text style={linkLine}>
            • <a href={bookingUrl} style={link}>Agendar com um especialista</a>
          </Text>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>Equipe Comercial — {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ProposalReadyEmail,
  subject: (data: Record<string, any>) =>
    `Sua proposta ${SITE_NAME}${data?.dealTitle ? ` — ${data.dealTitle}` : ''}`,
  displayName: 'Proposta pronta',
  previewData: {
    customerName: 'João Silva',
    dealTitle: 'Antivírus + 10TB Backup em Nuvem',
    proposalUrl: 'https://example.com/proposta.pdf',
    trackingUrl: 'https://example.com/cotacao/abc',
    bookingUrl: 'https://example.com/agendar/xyz',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a2540', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#3c4257', lineHeight: '1.6', margin: '0 0 16px' }
const btnSection = { textAlign: 'center' as const, margin: '24px 0' }
const primaryBtn = {
  backgroundColor: '#ff6a00',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
}
const hr = { borderColor: '#e6ebf1', margin: '24px 0' }
const link = { color: '#0a2540', textDecoration: 'underline' }
const linkLine = { fontSize: '14px', color: '#3c4257', margin: '0 0 8px' }
const footer = { fontSize: '12px', color: '#8898aa', margin: '24px 0 0' }
