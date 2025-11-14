import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Generate QR code data (simple JSON string for now)
    const qrData = JSON.stringify({
      requestId: request.id,
      clubSlug: request.club_slug,
      email: request.email,
      visitDate: request.visit_date,
      visitorCount: request.visitor_count,
      approvedAt: new Date().toISOString(),
    });

    // For production, you would generate an actual QR code image URL here
    // For now, we'll store the QR data as a base64 encoded string
    const qrCodeUrl = `data:text/plain;base64,${btoa(qrData)}`;

    // Set expiration to 7 days from approval
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update the invitation request
    const { error: updateError } = await supabaseClient
      .from('invitation_requests')
      .update({
        status: 'approved',
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
        message: 'Invitation approved successfully',
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
