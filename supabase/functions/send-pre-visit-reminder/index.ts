import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EligibleInvitation {
  id: number;
  club_slug: string;
  email: string;
  visitor_names: string[];
  visitor_first_names: string[] | null;
  visit_date: string;
  invitation_code: string;
  language: string;
}

const generatePreVisitEmailHTML = (
  visitorName: string,
  clubName: string,
  visitDate: string,
  invitationCode: string,
  language: string,
  clubAddress: string,
): string => {
  const isSpanish = language === "es";
  const formattedDate = new Date(visitDate).toLocaleDateString(
    isSpanish ? "es-ES" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSpanish ? "¡Tu visita se acerca!" : "Your visit is coming up!"}</title>
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
                ${isSpanish ? "🎉 ¡Tu visita es en 2 días!" : "🎉 Your visit is in 2 days!"}
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
                  ? `¡Estamos deseando recibirte en <strong>${clubName}</strong>! Aquí tienes todo lo que necesitas para tu visita.`
                  : `We're looking forward to welcoming you at <strong>${clubName}</strong>! Here's everything you need for your visit.`}
              </p>
            </td>
          </tr>

          <!-- Visit Details Card -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;color:#333;font-size:15px;line-height:22px;">
                      <strong>📅 ${isSpanish ? "Fecha:" : "Date:"}</strong> ${formattedDate}
                    </p>
                    <p style="margin:0 0 12px;color:#333;font-size:15px;line-height:22px;">
                      <strong>📍 ${isSpanish ? "Club:" : "Club:"}</strong> ${clubName}
                    </p>
                    ${clubAddress ? `<p style="margin:0 0 12px;color:#333;font-size:15px;line-height:22px;">
                      <strong>🏠 ${isSpanish ? "Dirección:" : "Address:"}</strong> ${clubAddress}
                    </p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invitation Code -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;border-radius:8px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 8px;color:#666;font-size:13px;">
                      ${isSpanish ? "Tu código de invitación:" : "Your invitation code:"}
                    </p>
                    <div style="font-family:monospace;font-size:32px;font-weight:bold;color:#16a34a;letter-spacing:3px;">
                      ${invitationCode}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What to Bring -->
          <tr>
            <td style="padding:0 24px 24px;">
              <h2 style="margin:0 0 12px;color:#333;font-size:18px;">
                ${isSpanish ? "📋 Qué necesitas llevar:" : "📋 What to bring:"}
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:6px;border-left:4px solid #f59e0b;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Documento de identidad válido (DNI/Pasaporte)" : "Valid photo ID (ID card / Passport)"}</p>
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Tu código de invitación (arriba)" : "Your invitation code (above)"}</p>
                    <p style="margin:0;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Debes ser mayor de 18 años" : "You must be 18+ years old"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Benefits -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:6px;border-left:4px solid #16a34a;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Ambiente seguro y acogedor" : "Safe and welcoming environment"}</p>
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Productos de calidad premium" : "Premium quality products"}</p>
                    <p style="margin:0 0 8px;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Personal experimentado y amable" : "Experienced and friendly staff"}</p>
                    <p style="margin:0;color:#333;font-size:14px;line-height:20px;">✓ ${isSpanish ? "Comunidad inclusiva" : "Inclusive community"}</p>
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
                  ? "¡Nos vemos pronto! Si tienes alguna pregunta, no dudes en contactarnos."
                  : "See you soon! If you have any questions, feel free to reach out."}
              </p>
              <p style="margin:0;color:#333;font-size:15px;line-height:22px;">
                ${isSpanish ? "¡Hasta pronto!" : "See you there!"}<br>
                <strong>${clubName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer Note -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="margin:0;color:#898989;font-size:13px;line-height:20px;text-align:center;">
                ${isSpanish
                  ? "Este es un recordatorio automático de tu cita programada."
                  : "This is an automatic reminder for your scheduled visit."}
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("Starting pre-visit reminder job...");

    // Find invitations with visit_date exactly 2 days from now
    // Using raw SQL date comparison for accuracy
    const todayPlus2 = new Date();
    todayPlus2.setDate(todayPlus2.getDate() + 2);
    const targetDate = todayPlus2.toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: eligibleInvitations, error: queryError } = await supabase
      .from("invitation_requests")
      .select(
        "id, club_slug, email, visitor_names, visitor_first_names, visit_date, invitation_code, language",
      )
      .in("status", ["sent", "approved"])
      .or("attended.is.null,attended.eq.false")
      .is("pre_visit_reminder_sent_at", null)
      .eq("visit_date", targetDate);

    if (queryError) {
      console.error("Error querying invitations:", queryError);
      throw new Error(`Failed to query invitations: ${queryError.message}`);
    }

    console.log(
      `Found ${eligibleInvitations?.length || 0} invitations for pre-visit reminder (visit_date = ${targetDate})`,
    );

    if (!eligibleInvitations || eligibleInvitations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No invitations require pre-visit reminders",
          emailsSent: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    const results: { id: number; success: boolean; error?: string }[] = [];

    for (const invitation of eligibleInvitations as EligibleInvitation[]) {
      try {
        // Fetch club details
        const { data: club, error: clubError } = await supabase
          .from("clubs")
          .select("name, address")
          .eq("slug", invitation.club_slug)
          .single();

        if (clubError || !club) {
          console.error(
            `Club not found for invitation ${invitation.id}:`,
            clubError,
          );
          results.push({
            id: invitation.id,
            success: false,
            error: "Club not found",
          });
          emailsFailed++;
          continue;
        }

        const visitorName = invitation.visitor_first_names?.[0] ||
          invitation.visitor_names?.[0] || "Friend";
        const clubName = club.name;

        const html = generatePreVisitEmailHTML(
          visitorName,
          clubName,
          invitation.visit_date,
          invitation.invitation_code || "",
          invitation.language || "en",
          club.address || "",
        );

        const { data: emailData, error: emailError } = await resend.emails
          .send({
            from: "Weed Madrid <invitations@weedmadrid.com>",
            to: [invitation.email],
            subject: invitation.language === "es"
              ? `🎉 ¡Tu visita a ${clubName} es en 2 días!`
              : `🎉 Your visit to ${clubName} is in 2 days!`,
            html,
          });

        if (emailError) {
          console.error(
            `Error sending email for invitation ${invitation.id}:`,
            emailError,
          );
          results.push({
            id: invitation.id,
            success: false,
            error: emailError.message,
          });
          emailsFailed++;
          continue;
        }

        console.log(
          `Pre-visit reminder sent for invitation ${invitation.id}:`,
          emailData,
        );

        // Mark as sent
        const { error: updateError } = await supabase
          .from("invitation_requests")
          .update({ pre_visit_reminder_sent_at: new Date().toISOString() })
          .eq("id", invitation.id);

        if (updateError) {
          console.error(
            `Error updating invitation ${invitation.id}:`,
            updateError,
          );
        }

        // Audit log
        await supabase.from("invitation_audit_log").insert({
          request_id: invitation.id,
          action: "pre_visit_reminder_sent",
          admin_email: "system@weedmadrid.com",
          metadata: {
            email_id: emailData?.id,
            sent_at: new Date().toISOString(),
            trigger: "cron_pre_visit_2d",
            visit_date: invitation.visit_date,
          },
        });

        emailsSent++;
        results.push({ id: invitation.id, success: true });
      } catch (invitationError: any) {
        console.error(
          `Error processing invitation ${invitation.id}:`,
          invitationError,
        );
        results.push({
          id: invitation.id,
          success: false,
          error: invitationError.message,
        });
        emailsFailed++;
      }
    }

    console.log(
      `Pre-visit reminder job completed: ${emailsSent} sent, ${emailsFailed} failed`,
    );

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
      },
    );
  } catch (error: any) {
    console.error("Error in send-pre-visit-reminder function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
