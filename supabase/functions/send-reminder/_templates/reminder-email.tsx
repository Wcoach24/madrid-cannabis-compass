interface ReminderEmailProps {
  visitorName: string;
  clubName: string;
  visitDate: string;
  invitationCode: string;
  language: string;
}

export const generateReminderEmailHTML = ({
  visitorName,
  clubName,
  visitDate,
  invitationCode,
  language,
}: ReminderEmailProps): string => {
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

export default generateReminderEmailHTML;
