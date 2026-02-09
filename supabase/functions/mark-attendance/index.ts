import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarkAttendanceRequest {
  requestId: number;
  attended: boolean;
  actualAttendeeCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody: MarkAttendanceRequest = await req.json();
    const { requestId, attended, actualAttendeeCount } = requestBody;

    // Fetch the invitation request
    const { data: invitation, error: fetchError } = await supabase
      .from('invitation_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if this is a correction (already marked before)
    const wasAlreadyMarked = invitation.attendance_marked_at !== null;
    const previousAttended = invitation.attended;
    const previousCount = invitation.actual_attendee_count;

    // Update attendance
    const { data: updated, error: updateError } = await supabase
      .from('invitation_requests')
      .update({
        attended,
        actual_attendee_count: actualAttendeeCount,
        attendance_marked_at: new Date().toISOString(),
        attendance_marked_by: user.id,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Determine audit action
    let action: string;
    if (wasAlreadyMarked) {
      action = attended ? 'corrected_to_attended' : 'corrected_to_no_show';
    } else {
      action = attended ? 'marked_attended' : 'marked_no_show';
    }

    // Log audit entry
    await supabase
      .from('invitation_audit_log')
      .insert({
        request_id: requestId,
        action,
        admin_id: user.id,
        admin_email: user.email,
        metadata: {
          actual_attendee_count: actualAttendeeCount,
          visitor_count: invitation.visitor_count,
          ...(wasAlreadyMarked && {
            previous_attended: previousAttended,
            previous_actual_count: previousCount,
            is_correction: true,
          }),
        },
      });

    console.log('Attendance marked successfully:', requestId);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: updated,
        message: 'Attendance marked successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in mark-attendance:', error);
    
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
