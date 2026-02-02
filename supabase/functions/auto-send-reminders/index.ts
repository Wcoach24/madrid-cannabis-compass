import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  id: number;
  club_slug: string;
  email: string;
  visitor_names: string[];
  visit_date: string;
  invitation_code: string;
  language: string;
}

const generateReminderEmailHTML = (
  visitorName: string,
  clubName: string,
  visitDate: string,
  invitationCode: string,
  language: string
): string => {
  const isSpanish = language === 'es';
  const formattedDate = new Date(visitDate).toLocaleDateString(
    isSpanish ? 'es-ES' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSpanish ? 'Recordatorio de Invitación' : 'Invitation Reminder'}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f9fc;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;max-width:600px;border-radius:8px;">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px 24px 24px;text-align:center;">
              <h1 style="margin:0;color:#16a34a;font-size:28px;font-weight:bold;">
                ${isSpanish ? '¡No te lo pierdas!' : "Don't Miss Out!"}
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 24px;">
              <p style="margin:0 0 16px;color:#333;font-size:16px;line-height:24px;">
                ${isSpanish ? `Hola ${visitorName},` : `Hi ${visitorName},`}
              </p>
              <p style="margin:0 0 24px;color:#333;font-size:16px;line-height:24px;">
                ${isSpanish 
                  ? `Notamos que aún no has visitado <strong>${clubName}</strong>. Tu invitación todavía está activa y te estamos esperando.`
                  : `We noticed you haven't visited <strong>${clubName}</strong> yet. Your invitation is still active and we're looking forward to seeing you!`}
              </p>
            </td>
          </tr>

          <!-- Invitation Code -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;border-radius:8px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 8px;color:#666;font-size:13px;">
                      ${isSpanish ? 'Tu código de invitación:' : 'Your invitation code:'}
                    </p>
                    <div style="font-family:monospace;font-size:32px;font-weight:bold;color:#16a34a;letter-spacing:3px;">
                      ${invitationCode}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Visit Date -->
          <tr>
            <td style="padding:0 24px 24px;">
              <p style="margin:0;color:#333;font-size:15px;line-height:22px;">
                <strong>${isSpanish ? 'Fecha de visita:' : 'Visit date:'}</strong><br>
                ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- Benefits -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:6px;border-left:4px solid #16a34a;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? 'Ambiente seguro y acogedor' : 'Safe and welcoming environment'}</p>
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? 'Productos de calidad premium' : 'Premium quality products'}</p>
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? 'Personal experimentado y amable' : 'Experienced and friendly staff'}</p>
                    <p style="margin:0;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? 'Comunidad inclusiva' : 'Inclusive community'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Message -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="margin:0 0 24px;color:#333;font-size:15px;line-height:22px;">
                ${isSpanish 
                  ? 'Simplemente presenta tu código de invitación cuando llegues. ¡Esperamos verte pronto!'
                  : 'Simply present your invitation code when you arrive. We hope to see you soon!'}
              </p>
              <p style="margin:0;color:#333;font-size:15px;line-height:22px;">
                ${isSpanish ? 'Saludos cordiales,' : 'Best regards,'}<br>
                <strong>${clubName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer Note -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="margin:0;color:#898989;font-size:13px;line-height:20px;text-align:center;">
                ${isSpanish 
                  ? 'Si tienes alguna pregunta, no dudes en contactarnos.'
                  : 'If you have any questions, feel free to contact us.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting auto-send-reminders job...");

    // Query invitations eligible for automatic reminder:
    // - status is 'sent' or 'approved' (valid invitations)
    // - attended is NOT true (null or false)
    // - visit_date is more than 48 hours ago
    // - auto_reminder_sent_at is NULL (no auto-reminder sent yet)
    const { data: eligibleInvitations, error: queryError } = await supabase
      .from("invitation_requests")
      .select("id, club_slug, email, visitor_names, visit_date, invitation_code, language")
      .in("status", ["sent", "approved"])
      .or("attended.is.null,attended.eq.false")
      .is("auto_reminder_sent_at", null)
      .lt("visit_date", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split("T")[0]);

    if (queryError) {
      console.error("Error querying invitations:", queryError);
      throw new Error(`Failed to query invitations: ${queryError.message}`);
    }

    console.log(`Found ${eligibleInvitations?.length || 0} invitations eligible for auto-reminder`);

    if (!eligibleInvitations || eligibleInvitations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No invitations require automatic reminders",
          emailsSent: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    const results: { id: number; success: boolean; error?: string }[] = [];

    for (const invitation of eligibleInvitations as InvitationRequest[]) {
      try {
        // Fetch club name
        const { data: club, error: clubError } = await supabase
          .from("clubs")
          .select("name")
          .eq("slug", invitation.club_slug)
          .single();

        if (clubError || !club) {
          console.error(`Club not found for invitation ${invitation.id}:`, clubError);
          results.push({ id: invitation.id, success: false, error: "Club not found" });
          emailsFailed++;
          continue;
        }

        const visitorName = invitation.visitor_names[0] || "Friend";
        const clubName = club.name;

        // Generate email HTML
        const html = generateReminderEmailHTML(
          visitorName,
          clubName,
          invitation.visit_date,
          invitation.invitation_code || "",
          invitation.language || "en"
        );

        // Send the email
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Weed Madrid <invitations@weedmadrid.com>",
          to: [invitation.email],
          subject: invitation.language === "es"
            ? `Recordatorio: Tu invitación para ${clubName}`
            : `Reminder: Your invitation to ${clubName}`,
          html,
        });

        if (emailError) {
          console.error(`Error sending email for invitation ${invitation.id}:`, emailError);
          results.push({ id: invitation.id, success: false, error: emailError.message });
          emailsFailed++;
          continue;
        }

        console.log(`Email sent for invitation ${invitation.id}:`, emailData);

        // Update auto_reminder_sent_at immediately after successful send
        const { error: updateError } = await supabase
          .from("invitation_requests")
          .update({ auto_reminder_sent_at: new Date().toISOString() })
          .eq("id", invitation.id);

        if (updateError) {
          console.error(`Error updating invitation ${invitation.id}:`, updateError);
          // Email was sent, so we still count it as success
        }

        // Log to audit
        await supabase.from("invitation_audit_log").insert({
          request_id: invitation.id,
          action: "auto_reminder_sent",
          admin_email: "system@weedmadrid.com",
          metadata: {
            email_id: emailData?.id,
            sent_at: new Date().toISOString(),
            trigger: "cron_48h",
          },
        });

        emailsSent++;
        results.push({ id: invitation.id, success: true });

      } catch (invitationError: any) {
        console.error(`Error processing invitation ${invitation.id}:`, invitationError);
        results.push({ id: invitation.id, success: false, error: invitationError.message });
        emailsFailed++;
      }
    }

    console.log(`Auto-reminder job completed: ${emailsSent} sent, ${emailsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${eligibleInvitations.length} invitations`,
        emailsSent,
        emailsFailed,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in auto-send-reminders function:", error);
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
