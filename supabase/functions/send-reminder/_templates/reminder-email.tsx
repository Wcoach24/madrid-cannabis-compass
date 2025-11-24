import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.15';
import * as React from 'https://esm.sh/react@18.2.0';

interface ReminderEmailProps {
  visitorName: string;
  clubName: string;
  visitDate: string;
  invitationCode: string;
  language: string;
}

export const ReminderEmail = ({
  visitorName,
  clubName,
  visitDate,
  invitationCode,
  language,
}: ReminderEmailProps) => {
  const isSpanish = language === 'es';

  return (
    <Html>
      <Head />
      <Preview>
        {isSpanish
          ? `Recordatorio: Tu invitación para ${clubName}`
          : `Reminder: Your invitation to ${clubName}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isSpanish ? '¡No te lo pierdas!' : "Don't Miss Out!"}
          </Heading>

          <Text style={text}>
            {isSpanish ? `Hola ${visitorName},` : `Hi ${visitorName},`}
          </Text>

          <Text style={text}>
            {isSpanish
              ? `Notamos que aún no has visitado ${clubName}. Tu invitación todavía está activa y te estamos esperando.`
              : `We noticed you haven't visited ${clubName} yet. Your invitation is still active and we're looking forward to seeing you!`}
          </Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>
              {isSpanish ? 'Tu código de invitación:' : 'Your invitation code:'}
            </Text>
            <code style={code}>{invitationCode}</code>
          </Section>

          <Text style={text}>
            <strong>{isSpanish ? 'Fecha de visita:' : 'Visit date:'}</strong>{' '}
            {new Date(visitDate).toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          <Section style={benefitsSection}>
            <Heading style={h2}>
              {isSpanish ? '¿Por qué visitarnos?' : 'Why visit us?'}
            </Heading>
            <Text style={text}>
              {isSpanish ? '✓ Ambiente seguro y acogedor' : '✓ Safe and welcoming environment'}
            </Text>
            <Text style={text}>
              {isSpanish ? '✓ Productos de calidad premium' : '✓ Premium quality products'}
            </Text>
            <Text style={text}>
              {isSpanish ? '✓ Personal experimentado y amable' : '✓ Experienced and friendly staff'}
            </Text>
            <Text style={text}>
              {isSpanish ? '✓ Comunidad inclusiva' : '✓ Inclusive community'}
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            {isSpanish
              ? 'Simplemente presenta tu código de invitación cuando llegues. ¡Esperamos verte pronto!'
              : 'Simply present your invitation code when you arrive. We hope to see you soon!'}
          </Text>

          <Text style={footer}>
            {isSpanish
              ? `Saludos cordiales,`
              : `Best regards,`}
            <br />
            <strong>{clubName}</strong>
          </Text>

          <Text style={footerNote}>
            {isSpanish
              ? 'Si tienes alguna pregunta, no dudes en contactarnos.'
              : 'If you have any questions, feel free to contact us.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReminderEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const codeBox = {
  background: '#f4f4f4',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
  textAlign: 'center' as const,
};

const codeLabel = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 8px',
};

const code = {
  display: 'inline-block',
  fontFamily: 'monospace',
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  color: '#16a34a',
  backgroundColor: 'transparent',
};

const benefitsSection = {
  margin: '32px 40px',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  borderLeft: '4px solid #16a34a',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 40px',
};

const footer = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 40px 16px',
};

const footerNote = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 40px',
};
