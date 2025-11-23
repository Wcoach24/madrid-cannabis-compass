import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get all invitations
    const { data: allInvitations, error: allError } = await supabase
      .from('invitation_requests')
      .select('*');

    if (allError) throw allError;

    const totalInvitations = allInvitations?.length || 0;
    
    // Status counts
    const totalSent = allInvitations?.filter(i => i.status === 'sent' || i.status === 'approved').length || 0;
    const totalFailed = allInvitations?.filter(i => i.status === 'failed').length || 0;
    const totalPending = allInvitations?.filter(i => i.status === 'pending').length || 0;
    
    // Attendance counts (only for sent/approved invitations)
    const sentInvitations = allInvitations?.filter(i => i.status === 'sent' || i.status === 'approved') || [];
    const totalAttended = sentInvitations.filter(i => i.attended === true).length;
    const totalNoShows = sentInvitations.filter(i => i.attended === false && i.attendance_marked_at !== null).length;
    const pendingConfirmation = sentInvitations.filter(i => i.attendance_marked_at === null).length;
    
    // Attendance rate (only count marked attendances)
    const markedAttendances = totalAttended + totalNoShows;
    const attendanceRate = markedAttendances > 0 
      ? Math.round((totalAttended / markedAttendances) * 100) 
      : 0;
    
    // Average attendees per invitation (only for those that attended)
    const attendedWithCounts = sentInvitations.filter(i => 
      i.attended === true && i.actual_attendee_count !== null
    );
    const avgAttendeesPerInvitation = attendedWithCounts.length > 0
      ? Math.round(
          attendedWithCounts.reduce((sum, i) => sum + (i.actual_attendee_count || 0), 0) / 
          attendedWithCounts.length * 10
        ) / 10
      : 0;

    const metrics = {
      totalInvitations,
      totalSent,
      totalFailed,
      totalPending,
      totalAttended,
      totalNoShows,
      pendingConfirmation,
      attendanceRate,
      avgAttendeesPerInvitation,
    };

    console.log('Metrics calculated:', metrics);

    return new Response(
      JSON.stringify({ 
        success: true,
        metrics
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in get-invitation-metrics:', error);
    
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
