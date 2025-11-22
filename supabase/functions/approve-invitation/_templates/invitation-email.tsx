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
    <Preview>Your Weed Madrid Invitation - {invitationCode}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={logo}>🌿 WEED MADRID</Heading>
        </Section>
        
        <Heading style={h1}>Your Invitation is Approved!</Heading>
        
        <Text style={text}>
          Your request to visit <strong>{clubName}</strong> has been approved. Follow the instructions below to access the club.
        </Text>

        <Section style={doorInstructionBox}>
          <Text style={doorInstructionLabel}>📱 SHOW THIS CODE AT THE DOOR</Text>
        </Section>

        <Section style={codeSection}>
          <Text style={code}>{invitationCode}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={doorStepsSection}>
          <Heading style={h2}>🚪 AT THE DOOR</Heading>
          <Text style={stepText}>1. Show this invitation code on your phone</Text>
          <Text style={stepText}>2. Present your ID (passport or national ID card)</Text>
          <Text style={stepText}>3. Confirm your name matches the reservation</Text>
          <Text style={stepText}>4. You'll be registered as a guest member</Text>
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
          <Text style={detailText}>
            <strong>Valid for:</strong> 30 days from approval
          </Text>
        </Section>

        <Section style={actionSection}>
          <Link 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clubAddress + ', Madrid')}`}
            style={mapButton}
          >
            📍 Open in Google Maps
          </Link>
          <Link 
            href="https://wa.me/34632332050"
            style={whatsappButton}
          >
            💬 WhatsApp Club
          </Link>
        </Section>

        <Hr style={hr} />

        <Section style={tipsSection}>
          <Heading style={h2}>Important Tips</Heading>
          <Text style={tipText}>🕐 Check club opening hours before visiting</Text>
          <Text style={tipText}>🎒 Bring a valid ID - entry requires verification</Text>
          <Text style={tipText}>📱 Save this email or screenshot the code</Text>
          <Text style={tipText}>❓ Lost or have questions? Contact the club via WhatsApp</Text>
        </Section>

        <Hr style={hr} />

        <Section style={legalSection}>
          <Heading style={legalHeading}>⚠️ Legal Notice - Read Carefully</Heading>
          <Text style={legalText}>
            Cannabis clubs in Madrid are <strong>private, non-profit associations</strong>. This invitation grants you access as a guest member. 
          </Text>
          <Section style={legalDoSection}>
            <Text style={legalDoTitle}>✅ DO:</Text>
            <Text style={legalDoText}>• Consume cannabis ONLY inside the club premises</Text>
            <Text style={legalDoText}>• Respect club rules and Spanish cannabis legislation</Text>
            <Text style={legalDoText}>• Verify you are 18+ years old</Text>
          </Section>
          <Section style={legalDontSection}>
            <Text style={legalDontTitle}>❌ DON'T:</Text>
            <Text style={legalDontText}>• Never consume cannabis in public spaces (illegal)</Text>
            <Text style={legalDontText}>• Never attempt to sell or distribute cannabis (illegal)</Text>
            <Text style={legalDontText}>• Never take cannabis outside of Spain (federal crime)</Text>
          </Section>
          <Text style={legalWarning}>
            Public consumption, sale, or distribution is <strong>illegal under Spanish law</strong> and can result in fines or prosecution.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Questions? Visit <Link href="https://www.weedmadrid.com" target="_blank" style={link}>weedmadrid.com</Link> or reply to this email.
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
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '12px',
  border: '2px solid #d4af37',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.2)',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  color: '#d4af37',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
  letterSpacing: '2px',
};

const h1 = {
  color: '#ffd700',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
  lineHeight: '1.3',
};

const h2 = {
  color: '#d4af37',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const doorInstructionBox = {
  textAlign: 'center' as const,
  margin: '24px 0 16px',
};

const doorInstructionLabel = {
  color: '#ffd700',
  fontSize: '18px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0',
};

const codeSection = {
  background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
  borderRadius: '12px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  border: '3px solid #ffd700',
  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
};

const code = {
  color: '#0a0a0a',
  fontSize: '48px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  letterSpacing: '4px',
  margin: '0',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #333333',
  margin: '32px 0',
};

const doorStepsSection = {
  backgroundColor: 'rgba(212, 175, 55, 0.1)',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid rgba(212, 175, 55, 0.3)',
};

const stepText = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '8px 0',
  fontWeight: '500',
};

const detailsSection = {
  margin: '24px 0',
};

const detailText = {
  color: '#cccccc',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const actionSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const mapButton = {
  display: 'inline-block',
  backgroundColor: '#d4af37',
  color: '#0a0a0a',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  margin: '8px',
  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
};

const whatsappButton = {
  display: 'inline-block',
  backgroundColor: '#25D366',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  margin: '8px',
  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
};

const tipsSection = {
  margin: '24px 0',
};

const tipText = {
  color: '#cccccc',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
};

const legalSection = {
  backgroundColor: 'rgba(212, 175, 55, 0.15)',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #d4af37',
};

const legalHeading = {
  color: '#ffd700',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const legalText = {
  color: '#e5e5e5',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const legalDoSection = {
  margin: '16px 0',
};

const legalDoTitle = {
  color: '#4ade80',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const legalDoText = {
  color: '#cccccc',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '4px 0',
};

const legalDontSection = {
  margin: '16px 0',
};

const legalDontTitle = {
  color: '#f87171',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const legalDontText = {
  color: '#cccccc',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '4px 0',
};

const legalWarning = {
  color: '#ffd700',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '16px 0 0',
  fontWeight: '600',
  textAlign: 'center' as const,
};

const footer = {
  color: '#999999',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
};

const footerBrand = {
  color: '#d4af37',
  fontSize: '13px',
  margin: '0',
  textAlign: 'center' as const,
  fontWeight: '600',
};

const link = {
  color: '#d4af37',
  textDecoration: 'underline',
};
