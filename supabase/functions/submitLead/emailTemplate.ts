const CONFIRMATION_SUBJECT = "Comelu: registro confirmado";
const CONFIRMATION_TEXT_TEMPLATE = `Hola {{name}},

Tu registro en la lista de espera de Comelu quedó confirmado.

Te contactaremos pronto con los siguientes pasos.

Este correo no recibe respuestas.`;
const CONFIRMATION_HTML_TEMPLATE = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#05070a;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e8edf4;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0f141c;border:1px solid #1f2a38;border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,0.35);">
            <tr>
              <td style="font-size:12px;letter-spacing:0.14em;color:#7f91a7;text-transform:uppercase;padding-bottom:12px;">Comelu</td>
            </tr>
            <tr>
              <td style="font-size:22px;line-height:1.3;font-weight:600;color:#f5f8fc;padding-bottom:12px;">
                Registro confirmado
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#c8d3e0;padding-bottom:18px;">
                Hola {{name}}, tu registro en la lista de espera quedó confirmado.
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#c8d3e0;padding-bottom:18px;">
                Te contactaremos pronto con los siguientes pasos.
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.5;color:#8fa1b8;border-top:1px solid #1f2a38;padding-top:14px;">
                Este correo no recibe respuestas.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const replaceNamePlaceholder = (template: string, name: string) => template.replaceAll("{{name}}", name);

const getTemplateName = (rawName: string) => {
  const trimmed = rawName.trim();
  if (!trimmed) return "ahí";
  return trimmed.split(/\s+/)[0] || "hola";
};

export const buildLeadEmailTemplate = (rawName: string) => {
  const name = getTemplateName(rawName);
  return {
    subject: CONFIRMATION_SUBJECT,
    text: replaceNamePlaceholder(CONFIRMATION_TEXT_TEMPLATE, name),
    html: replaceNamePlaceholder(CONFIRMATION_HTML_TEMPLATE, name),
  };
};
