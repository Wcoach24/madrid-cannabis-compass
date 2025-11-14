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
      .select('id, name, slug')
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
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Log audit entry
    await supabase
      .from('invitation_audit_log')
      .insert({
        request_id: invitation.id,
        action: 'created',
        ip_address: ipAddress,
        metadata: {
          club_name: club.name,
          visitor_count: requestBody.visitor_count,
          visit_date: requestBody.visit_date,
        },
      });

    console.log('Invitation request created successfully:', invitation.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        request_id: invitation.id,
        message: 'Invitation request submitted successfully'
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
