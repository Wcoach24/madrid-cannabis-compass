import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequestBody {
  club_slug: string;
  language: string;
  visit_date: string;
  email: string;
  phone: string;
  visitor_count: number;
  visitor_names: string[];
  legal_age_confirmed: boolean;
  legal_knowledge_confirmed: boolean;
  gdpr_consent: boolean;
  notes?: string;
  user_agent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestBody: InvitationRequestBody = await req.json();
    
    // Get IP address from request
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Processing invitation request:', {
      club_slug: requestBody.club_slug,
      email: requestBody.email,
      visitor_count: requestBody.visitor_count,
      ip_address: ipAddress,
    });

    // Rate limiting check: Max 3 requests per hour per email
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from('invitation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('email', requestBody.email)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check error:', countError);
      throw new Error('Failed to check rate limit');
    }

    if (count !== null && count >= 3) {
      console.log('Rate limit exceeded for email:', requestBody.email);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify club exists and is active
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name, slug, address')
      .eq('slug', requestBody.club_slug)
      .eq('status', 'active')
      .single();

    if (clubError || !club) {
      console.error('Club not found:', requestBody.club_slug);
      return new Response(
        JSON.stringify({ error: 'Club not found or inactive' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate expiration date (visit_date + 1 day)
    const visitDate = new Date(requestBody.visit_date);
    const expiresAt = new Date(visitDate);
    expiresAt.setDate(expiresAt.getDate() + 1);

    // Generate invitation code
    const generateInvitationCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'WEED-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const invitationCode = generateInvitationCode();

    // Insert invitation request
    const { data: invitation, error: insertError } = await supabase
      .from('invitation_requests')
      .insert({
        club_slug: requestBody.club_slug,
        language: requestBody.language,
        visit_date: requestBody.visit_date,
        email: requestBody.email.toLowerCase().trim(),
        phone: requestBody.phone.trim(),
        visitor_count: requestBody.visitor_count,
        visitor_names: requestBody.visitor_names,
        legal_age_confirmed: requestBody.legal_age_confirmed,
        legal_knowledge_confirmed: requestBody.legal_knowledge_confirmed,
        gdpr_consent: requestBody.gdpr_consent,
        notes: requestBody.notes || null,
        status: 'pending',
        ip_address: ipAddress,
        user_agent: requestBody.user_agent || null,
        expires_at: expiresAt.toISOString(),
        invitation_code: invitationCode,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Invitation request created, sending email...');

    // Send invitation email
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let emailStatus = 'sent';
    let emailSentAt = new Date().toISOString();

    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weed Madrid Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a0f2e; border-radius: 16px; border: 2px solid rgba(212, 175, 55, 0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: bold; text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);">
                🌿 Your Invitation is Ready!
              </h1>
            </td>
          </tr>

          <!-- Invitation Code Box -->
          <tr>
            <td align="center" style="padding: 20px 40px;">
              <div style="background: linear-gradient(135deg, #d4af37, #ffd700); padding: 30px; border-radius: 12px; box-shadow: 0 0 40px rgba(212, 175, 55, 0.4);">
                <p style="margin: 0 0 10px; color: #0a0a0a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  SHOW THIS CODE AT THE DOOR
                </p>
                <p style="margin: 0; color: #0a0a0a; font-size: 48px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  ${invitationCode}
                </p>
              </div>
            </td>
          </tr>

          <!-- At the Door Instructions -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 15px; color: #ffd700; font-size: 20px; font-weight: bold;">
                📍 At the Door
              </h2>
              <ol style="margin: 0; padding-left: 20px; color: #e0e0e0; font-size: 15px; line-height: 1.8;">
                <li>Show this invitation code: <strong style="color: #ffd700;">${invitationCode}</strong></li>
                <li>Present your valid ID</li>
                <li>Confirm your name from the guest list</li>
              </ol>
            </td>
          </tr>

          <!-- Club Information -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 15px; color: #ffd700; font-size: 20px; font-weight: bold;">
                🏛️ Club Information
              </h2>
              <p style="margin: 0 0 10px; color: #e0e0e0; font-size: 15px;">
                <strong style="color: #d4af37;">Club:</strong> ${club.name}
              </p>
              <p style="margin: 0 0 10px; color: #e0e0e0; font-size: 15px;">
                <strong style="color: #d4af37;">Address:</strong> ${club.address}
              </p>
              <p style="margin: 0 0 20px; color: #e0e0e0; font-size: 15px;">
                <strong style="color: #d4af37;">Visit Date:</strong> ${new Date(requestBody.visit_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <!-- WhatsApp Button -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #25D366, #128C7E); border-radius: 8px; padding: 12px 24px;">
                    <a href="https://wa.me/34632332050" style="color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
                      💬 Contact via WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Notice -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background-color: rgba(255, 215, 0, 0.1); border-left: 4px solid #ffd700; padding: 15px; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #ffd700; font-size: 14px; font-weight: 600;">
                  ⚖️ Important Legal Information
                </p>
                <p style="margin: 0; color: #c0c0c0; font-size: 13px; line-height: 1.6;">
                  Cannabis social clubs are private, non-profit associations. Members must be 18+. Cannabis consumption is only legal within club premises. Public consumption is illegal and subject to fines.
                </p>
              </div>
            </td>
          </tr>

          <!-- DO/DON'T Section -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <h3 style="margin: 0 0 10px; color: #4ade80; font-size: 16px; font-weight: bold;">
                      ✅ DO
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #c0c0c0; font-size: 13px; line-height: 1.8;">
                      <li>Bring valid ID</li>
                      <li>Respect club rules</li>
                      <li>Consume only inside</li>
                    </ul>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px;">
                    <h3 style="margin: 0 0 10px; color: #f87171; font-size: 16px; font-weight: bold;">
                      ❌ DON'T
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #c0c0c0; font-size: 13px; line-height: 1.8;">
                      <li>Consume in public</li>
                      <li>Share with non-members</li>
                      <li>Drive after consuming</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 40px 40px;">
              <p style="margin: 0; color: #808080; font-size: 12px;">
                Questions? Contact us at <a href="mailto:info@weedmadrid.com" style="color: #d4af37; text-decoration: none;">info@weedmadrid.com</a>
              </p>
              <p style="margin: 10px 0 0; color: #606060; font-size: 11px;">
                © 2025 Weed Madrid. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Weed Madrid <invitations@weedmadrid.com>',
          to: [requestBody.email],
          subject: `Your Invitation Code: ${invitationCode}`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('Email sending failed:', errorData);
        emailStatus = 'failed';
        emailSentAt = null as any;
      } else {
        console.log('Email sent successfully');
      }
    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      emailStatus = 'failed';
      emailSentAt = null as any;
    }

    // Update invitation with email status
    await supabase
      .from('invitation_requests')
      .update({
        status: emailStatus,
        email_sent_at: emailSentAt,
      })
      .eq('id', invitation.id);

    // Log audit entry
    await supabase
      .from('invitation_audit_log')
      .insert({
        request_id: invitation.id,
        action: emailStatus === 'sent' ? 'email_sent' : 'email_failed',
        ip_address: ipAddress,
        metadata: {
          club_name: club.name,
          visitor_count: requestBody.visitor_count,
          visit_date: requestBody.visit_date,
          invitation_code: invitationCode,
        },
      });

    console.log('Invitation request processed:', invitation.id, 'Status:', emailStatus);

    return new Response(
      JSON.stringify({ 
        success: emailStatus === 'sent',
        request_id: invitation.id,
        invitation_code: invitationCode,
        message: emailStatus === 'sent' 
          ? 'Invitation sent to your email!' 
          : 'Invitation created but email failed. Please contact support.',
        email_status: emailStatus
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in submit-invitation-request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.details || null,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
