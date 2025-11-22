import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { InvitationEmail } from "./_templates/invitation-email.tsx";

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
      
      // Render email template
      const emailHtml = await renderAsync(
        React.createElement(InvitationEmail, {
          invitationCode,
          clubName: club.name,
          clubAddress: `${club.address}, ${club.district}, Madrid`,
          visitorNames: request.visitor_names,
          visitDate: request.visit_date,
          recipientEmail: request.email,
        })
      );

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
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
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
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
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
