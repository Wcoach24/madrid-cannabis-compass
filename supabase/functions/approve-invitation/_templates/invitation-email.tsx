import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface InvitationEmailProps {
  invitationCode: string;
  clubName: string;
  clubAddress: string;
  visitorNames: string[];
  visitDate: string;
  recipientEmail: string;
}

export const InvitationEmail = ({
  invitationCode,
  clubName,
  clubAddress,
  visitorNames,
  visitDate,
  recipientEmail,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Weed Madrid Invitation Code - {invitationCode}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={logo}>🌿 Weed Madrid</Heading>
        </Section>
        
        <Heading style={h1}>Your Invitation is Approved!</Heading>
        
        <Text style={text}>
          Great news! Your request to visit <strong>{clubName}</strong> has been approved.
        </Text>

        <Section style={codeSection}>
          <Text style={codeLabel}>Your Invitation Code:</Text>
          <Text style={code}>{invitationCode}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={detailsSection}>
          <Heading style={h2}>Visit Details</Heading>
          <Text style={detailText}>
            <strong>Club:</strong> {clubName}
          </Text>
          <Text style={detailText}>
            <strong>Address:</strong> {clubAddress}
          </Text>
          <Text style={detailText}>
            <strong>Visit Date:</strong> {new Date(visitDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Text style={detailText}>
            <strong>Visitors:</strong> {visitorNames.join(', ')}
          </Text>
          <Text style={detailText}>
            <strong>Email:</strong> {recipientEmail}
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={instructionsSection}>
          <Heading style={h2}>What to Do Next</Heading>
          <Text style={listItem}>1. Present this invitation code at the club</Text>
          <Text style={listItem}>2. Bring a valid ID (passport or national ID)</Text>
          <Text style={listItem}>3. Remember: You must be 18+ to enter</Text>
          <Text style={listItem}>4. Respect club rules and Spanish cannabis legislation</Text>
        </Section>

        <Hr style={hr} />

        <Section style={legalSection}>
          <Text style={legalText}>
            <strong>Important Legal Notice:</strong> Cannabis clubs in Madrid are private, 
            non-profit associations. This invitation grants you access as a guest member. 
            Cannabis consumption is only legal within the club premises. Public consumption, 
            sale, or distribution is illegal under Spanish law.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Questions? Visit{' '}
          <Link href="https://www.weedmadrid.com" target="_blank" style={link}>
            weedmadrid.com
          </Link>
          {' '}or reply to this email.
        </Text>

        <Text style={footerBrand}>
          🌿 Weed Madrid - Your Guide to Cannabis Clubs in Madrid
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InvitationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  color: '#10b981',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  lineHeight: '1.3',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const codeSection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '32px 0',
  border: '2px solid #10b981',
};

const codeLabel = {
  color: '#525252',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 12px',
};

const code = {
  color: '#10b981',
  fontSize: '32px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  margin: '0',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};

const detailsSection = {
  margin: '24px 0',
};

const detailText = {
  color: '#525252',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const instructionsSection = {
  margin: '24px 0',
};

const listItem = {
  color: '#525252',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
};

const legalSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const legalText = {
  color: '#92400e',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

const footer = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
};

const footerBrand = {
  color: '#a3a3a3',
  fontSize: '13px',
  margin: '0',
  textAlign: 'center' as const,
};

const link = {
  color: '#10b981',
  textDecoration: 'underline',
};