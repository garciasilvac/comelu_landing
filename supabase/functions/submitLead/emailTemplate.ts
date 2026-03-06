export type LeadEmailPayload = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: string;
  tamano: string;
  dolor: string;
  intereses: string[];
  checklist: boolean;
};

export type LeadEmailMetadata = {
  timestamp: string;
  source?: string;
  origin?: string;
  referrer?: string;
  userAgent?: string;
  clientIp?: string;
  leadId?: string;
};

type LeadEmailInput = {
  payload: LeadEmailPayload;
  metadata: LeadEmailMetadata;
};

const NA = "N/A";
const MAX_LONG_FIELD_LENGTH = 420;
const PAIN_LABELS: Record<string, string> = {
  "Información incompleta": "Información incompleta",
  "Archivos perdidos": "Archivos perdidos",
  "Estados confusos": "Estados confusos",
  "Pagos sin trazabilidad": "Pagos sin trazabilidad",
};
const INTEREST_LABELS: Record<string, string> = {
  "Órdenes + estados por etapa": "Órdenes + estados por etapa",
  "Archivos adjuntos por caso": "Archivos adjuntos por caso",
  "Pagos/saldos + comprobantes (transferencia)": "Pagos/saldos + comprobantes (transferencia)",
  "Notificaciones a clientes": "Notificaciones a clientes",
  "Reportes básicos (atrasos, carga de trabajo)": "Reportes básicos (atrasos, carga de trabajo)",
  "Acceso para clientes (link de seguimiento)": "Acceso para clientes (link de seguimiento)",
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeValue = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return NA;
  return trimmed;
};

const toBounded = (value: string | null | undefined, maxLength = 120) => {
  const normalized = normalizeValue(value);
  if (normalized === NA) return NA;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
};

const toHtmlValue = (value: string | null | undefined, maxLength = 120) => escapeHtml(toBounded(value, maxLength));

const toTextValue = (value: string | null | undefined, maxLength = 120) => toBounded(value, maxLength);

const mapPainLabel = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return NA;
  return PAIN_LABELS[normalized] ?? normalized;
};

const mapInterestLabel = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return NA;
  return INTEREST_LABELS[normalized] ?? normalized;
};

const formatPhone = (countryCode: string, number: string) => {
  const code = normalizeValue(countryCode);
  const digits = normalizeValue(number);
  if (code === NA && digits === NA) return NA;
  if (code === NA) return digits;
  if (digits === NA) return code;
  return `${code} ${digits}`;
};

const renderSummaryRow = (label: string, value: string) => {
  return `<tr>
    <td style="width:34%;padding:11px 12px;border-top:1px solid #1c2a3f;vertical-align:top;">
      <span style="display:inline-block;font-size:11px;line-height:1.3;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6ea8d8;">${escapeHtml(label)}</span>
    </td>
    <td style="padding:11px 12px;border-top:1px solid #1c2a3f;vertical-align:top;">
      <span style="font-size:14px;line-height:1.5;color:#d9e6f5;word-break:break-word;">${value}</span>
    </td>
  </tr>`;
};

const renderInterestsHtml = (values: string[]) => {
  if (!values.length) return toHtmlValue(NA, 10);

  const list = values
    .map((item) => `<li style="margin:0 0 6px 16px;padding:0;color:#d9e6f5;">${toHtmlValue(item, 180)}</li>`)
    .join("");

  return `<ul style="margin:0;padding:0;list-style:disc inside;">${list}</ul>`;
};

const renderInterestsText = (values: string[]) => {
  if (!values.length) return NA;
  return values.map((item) => `• ${toTextValue(item, 180)}`).join("\n");
};

export const buildLeadEmailTemplate = ({ payload, metadata }: LeadEmailInput) => {
  const name = toTextValue(payload.nombre, 120);
  const email = toTextValue(payload.email, 180);
  const phone = formatPhone(payload.telefonoPais, payload.telefonoNumero);
  const role = toTextValue(payload.rol, 80);
  const size = toTextValue(payload.tamano, 80);
  const pain = toTextValue(mapPainLabel(payload.dolor), MAX_LONG_FIELD_LENGTH);
  const interestLabels = payload.intereses.map((item) => mapInterestLabel(item)).filter(Boolean);

  const subject = `Comelu: registro confirmado — ${name}`;
  const summaryRows = [
    ["Nombre", toHtmlValue(name, 120)],
    ["Email", toHtmlValue(email, 180)],
    ["Teléfono", toHtmlValue(phone, 60)],
    ["Rol", toHtmlValue(role, 80)],
    ["Tamaño del laboratorio", toHtmlValue(size, 80)],
    ["Dolor principal", toHtmlValue(pain, MAX_LONG_FIELD_LENGTH)],
    ["¿Qué te interesa más?", renderInterestsHtml(interestLabels)],
  ]
    .map(([label, value]) => renderSummaryRow(label, value))
    .join("");

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#060b15;font-family:Inter,Segoe UI,Arial,sans-serif;color:#dce8f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#060b15;padding:16px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#0d1727;border:1px solid #1d2d46;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:22px 20px;background:linear-gradient(90deg,#0c1b30 0%,#112940 100%);border-bottom:1px solid #1e3551;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:12px;font-weight:700;line-height:1.4;letter-spacing:0.12em;text-transform:uppercase;color:#4fd1c5;">Comelu</td>
                  </tr>
                  <tr>
                    <td style="padding-top:8px;font-size:23px;line-height:1.35;font-weight:700;color:#eff6ff;">Gracias por registrarte en Comelu</td>
                  </tr>
                  <tr>
                    <td style="padding-top:8px;font-size:14px;line-height:1.6;color:#b8c8dd;">Recibimos correctamente tu información. Te contactaremos cuando la app esté lista para que puedas comenzar a usarla.</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #1c2a3f;border-radius:12px;overflow:hidden;background:#0a1322;">
                  <tr>
                    <td colspan="2" style="padding:12px 12px 10px;font-size:13px;font-weight:700;color:#87b7de;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1px solid #1c2a3f;">Resumen de tu registro</td>
                  </tr>
                  ${summaryRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px 18px;border-top:1px solid #1d2d46;font-size:12px;line-height:1.5;color:#8fa7c2;">
                Correo generado automáticamente por el formulario de Comelu.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Gracias por registrarte en Comelu.",
    "",
    "Recibimos correctamente tu información.",
    "Te contactaremos cuando la app esté lista para que puedas comenzar a usarla.",
    "",
    "Resumen de tu registro:",
    `- Nombre: ${name}`,
    `- Email: ${email}`,
    `- Teléfono: ${phone}`,
    `- Rol: ${role}`,
    `- Tamaño del laboratorio: ${size}`,
    `- Dolor principal: ${pain}`,
    "- ¿Qué te interesa más?:",
    renderInterestsText(interestLabels),
  ].join("\n");

  return { subject, html, text };
};
