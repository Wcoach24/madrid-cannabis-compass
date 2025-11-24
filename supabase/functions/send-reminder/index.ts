import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import * as React from "https://esm.sh/react@18.2.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15";
import { ReminderEmail } from "./_templates/reminder-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  requestId: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { requestId }: ReminderRequest = await req.json();

    console.log("Sending reminder for request ID:", requestId);

    // Fetch the invitation request details
    const { data: invitation, error: invitationError } = await supabase
      .from("invitation_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (invitationError || !invitation) {
      console.error("Error fetching invitation:", invitationError);
      throw new Error("Invitation not found");
    }

    // Check if the invitation is eligible for a reminder
    if (invitation.status !== "approved" && invitation.status !== "sent") {
      throw new Error("Invitation must be approved or sent to send a reminder");
    }

    if (invitation.attended) {
      throw new Error("Cannot send reminder for already attended invitation");
    }

    // Fetch club details using club_slug
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("name")
      .eq("slug", invitation.club_slug)
      .single();

    if (clubError || !club) {
      console.error("Error fetching club:", clubError);
      throw new Error("Club not found");
    }

    // Get club name and visitor name
    const clubName = club.name;
    const visitorName = invitation.visitor_names[0] || "Friend";

    // Render the email template
    const html = await renderAsync(
      React.createElement(ReminderEmail, {
        visitorName,
        clubName,
        visitDate: invitation.visit_date,
        invitationCode: invitation.invitation_code || "",
        language: invitation.language || "en",
      })
    );

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Weed Madrid <invitations@weedmadrid.com>",
      to: [invitation.email],
      subject:
        invitation.language === "es"
          ? `Recordatorio: Tu invitación para ${clubName}`
          : `Reminder: Your invitation to ${clubName}`,
      html,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Reminder email sent successfully:", emailData);

    // Log the reminder in the audit log
    await supabase.from("invitation_audit_log").insert({
      request_id: requestId,
      action: "reminder_sent",
      admin_email: invitation.email,
      metadata: {
        email_id: emailData?.id,
        sent_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminder sent successfully",
        emailId: emailData?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reminder function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
