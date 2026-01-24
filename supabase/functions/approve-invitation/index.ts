import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate random invitation code
const generateInvitationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "WEED-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated and has admin role
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !isAdmin) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { requestId } = await req.json();

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.email} approving invitation request ${requestId}`);

    // Get the invitation request details
    const { data: request, error: fetchError } = await supabaseClient
      .from('invitation_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Error fetching request:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already approved
    if (request.status === "approved") {
      return new Response(
        JSON.stringify({ error: 'This invitation has already been approved' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch club details
    const { data: club, error: clubError } = await supabaseClient
      .from("clubs")
      .select("name, address, district")
      .eq("slug", request.club_slug)
      .single();

    if (clubError || !club) {
      console.error("Error fetching club:", clubError);
      return new Response(
        JSON.stringify({ error: 'Club not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate invitation code
    const invitationCode = generateInvitationCode();
    
    console.log("Generated invitation code:", invitationCode);

    // Set expiration to 30 days from approval
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Generate QR code data (simple JSON string)
    const qrData = JSON.stringify({
      requestId: request.id,
      invitationCode,
      clubSlug: request.club_slug,
      email: request.email,
      visitDate: request.visit_date,
      visitorCount: request.visitor_count,
      approvedAt: new Date().toISOString(),
    });

    const qrCodeUrl = `data:text/plain;base64,${btoa(qrData)}`;

    // Update invitation request with code and approved status
    const { error: updateError } = await supabaseClient
      .from('invitation_requests')
      .update({
        status: 'approved',
        invitation_code: invitationCode,
        email_sent_at: new Date().toISOString(),
        qr_code_url: qrCodeUrl,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to approve request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email via Resend
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
      
      // Format visit date
      const visitDate = new Date(request.visit_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Generate plain HTML email
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weed Madrid Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #d4af37; font-size: 32px; margin: 0; font-weight: bold;">🔥 WEED MADRID</h1>
    </div>

    <!-- Invitation Code Box -->
    <div style="background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px; box-shadow: 0 0 40px rgba(212, 175, 55, 0.3);">
      <p style="margin: 0 0 10px 0; font-size: 16px; color: #0a0a0a; font-weight: 600; text-transform: uppercase;">Your Invitation Code</p>
      <h2 style="margin: 0 0 20px 0; font-size: 48px; color: #0a0a0a; font-weight: bold; letter-spacing: 4px;">${invitationCode}</h2>
      <p style="margin: 0; font-size: 18px; color: #0a0a0a; font-weight: bold;">⚠️ SHOW THIS CODE AT THE DOOR</p>
    </div>

    <!-- Club Details -->
    <div style="background-color: rgba(212, 175, 55, 0.1); border: 2px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
      <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 24px;">📍 Club Details</h3>
      <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.6;">
        <strong>Club:</strong> ${club.name}<br>
        <strong>Address:</strong> ${club.address}, ${club.district}, Madrid<br>
        <strong>Visit Date:</strong> ${visitDate}<br>
        <strong>Visitors:</strong> ${request.visitor_names.join(', ')}
      </p>
      
      <!-- Action Buttons -->
      <div style="margin-top: 25px;">
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.address + ', ' + club.district + ', Madrid')}" style="display: inline-block; background-color: #d4af37; color: #0a0a0a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px; font-size: 14px;">📍 Open in Google Maps</a>
        
        <a href="https://wa.me/34632332050" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px; font-size: 14px;">💬 WhatsApp Club (+34 632 332 050)</a>
      </div>
    </div>

    <!-- At the Door Section -->
    <div style="background-color: rgba(212, 175, 55, 0.1); border: 2px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
      <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 24px;">🚪 AT THE DOOR</h3>
      <ol style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.8;">
        <li><strong>Show this invitation code</strong> (${invitationCode})</li>
        <li><strong>Present your ID</strong> (must be 18+ or 21+ depending on club)</li>
        <li><strong>Confirm your name</strong> matches the invitation</li>
        <li>The club staff will complete your registration</li>
      </ol>
    </div>

    <!-- Important Tips -->
    <div style="background-color: rgba(212, 175, 55, 0.1); border: 2px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
      <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 20px;">💡 Important Tips</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #cccccc;">
        <li><strong>Save this email</strong> – you'll need to show the code at the door</li>
        <li><strong>Bring valid ID</strong> – passport or national ID card required</li>
        <li><strong>Only members can consume</strong> – clubs are private associations, not shops</li>
        <li><strong>Respect club rules</strong> – each club has its own house rules and etiquette</li>
        <li><strong>Check opening hours</strong> – contact the club via WhatsApp if unsure</li>
      </ul>
    </div>

    <!-- Legal Notice -->
    <div style="background-color: rgba(255, 0, 0, 0.1); border: 2px solid rgba(255, 0, 0, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
      <h3 style="color: #ff6b6b; margin: 0 0 15px 0; font-size: 18px;">⚖️ Legal Notice for International Visitors</h3>
      <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 1.6; color: #cccccc;">
        Cannabis social clubs in Spain operate as <strong>private non-profit associations</strong> under Spanish law. Membership and consumption are tolerated within club premises, but cannabis remains illegal in public spaces.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #cccccc;">
        <strong style="color: #ff6b6b;">DO:</strong> Consume only inside the club • Respect local laws • Bring valid ID • Follow club etiquette<br>
        <strong style="color: #ff6b6b;">DON'T:</strong> Consume in public • Take cannabis outside the club • Share with non-members • Resell or distribute
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
      <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888;">
        This invitation was sent to ${request.email}<br>
        Questions? Contact us at <a href="mailto:invitations@weedmadrid.com" style="color: #d4af37; text-decoration: none;">invitations@weedmadrid.com</a>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #666666;">
        Weed Madrid provides information for educational and cultural purposes.<br>
        We do not promote illegal activity.
      </p>
    </div>

  </div>
</body>
</html>
      `;

      console.log("Sending email to:", request.email);
      
      const { error: emailError } = await resend.emails.send({
        from: "Weed Madrid <invitations@weedmadrid.com>",
        to: [request.email],
        subject: `Your Weed Madrid Invitation Code: ${invitationCode}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Log the error but don't fail the request - invitation is already approved
        await supabaseClient
          .from("invitation_audit_log")
          .insert({
            request_id: requestId,
            admin_id: user.id,
            admin_email: user.email,
            action: "email_failed",
            ip_address: (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim(),
            metadata: { error: emailError.message },
          });
      } else {
        console.log("Email sent successfully");
      }
    } catch (emailError: any) {
      console.error("Error in email sending:", emailError);
      // Continue even if email fails - the invitation is approved
    }

    // Log the action in audit log
    const { error: auditError } = await supabaseClient
      .from('invitation_audit_log')
      .insert({
        request_id: requestId,
        admin_id: user.id,
        admin_email: user.email,
        action: 'approved',
        ip_address: (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim(),
        metadata: {
          invitation_code: invitationCode,
          club_slug: request.club_slug,
          qr_code_generated: true,
          expires_at: expiresAt.toISOString(),
        },
      });

    if (auditError) {
      console.error('Error logging audit:', auditError);
    }

    console.log(`Successfully approved invitation request ${requestId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation approved and email sent',
        invitationCode,
        qrCodeUrl,
        expiresAt: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in approve-invitation function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
