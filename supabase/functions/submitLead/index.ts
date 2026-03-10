import { createClient } from "npm:@supabase/supabase-js@2";
import { buildLeadEmailTemplate, type LeadEmailPayload } from "./emailTemplate.ts";

type LeadPayload = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: string;
  tamano: string;
  dolor: string;
  intereses: string[];
  checklist: boolean;
  website?: string;
  hp?: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const RESEND_EMAILS_API = "https://api.resend.com/emails";

type RateStore = Map<string, number[]>;
// MVP-only limiter: this is per Edge instance and resets on cold starts/redeploys.
const rateStore: RateStore = (globalThis as { __leadRateStore?: RateStore }).__leadRateStore ?? new Map();
(globalThis as { __leadRateStore?: RateStore }).__leadRateStore = rateStore;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });

const asTrimmedString = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const readBooleanEnv = (name: string, fallback = false) => {
  const value = Deno.env.get(name);
  if (!value) return fallback;

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const parseEmailRecipients = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const sendLeadNotificationEmail = async (input: {
  payload: LeadEmailPayload;
  to: string[];
  metadata: {
    timestamp: string;
  };
}) => {
  const emailDisabled = readBooleanEnv("EMAIL_DISABLED", true);
  const from = Deno.env.get("EMAIL_FROM");
  const { subject, text, html } = buildLeadEmailTemplate({
    payload: input.payload,
    metadata: input.metadata,
  });
  const htmlPreview = html.replace(/\s+/g, " ").slice(0, 220);

  if (emailDisabled) {
    console.info("[submitLead] EMAIL_DISABLED=true, would send lead notification email", {
      to: input.to,
      subject,
      textPreview: text.slice(0, 220),
      htmlPreview,
    });
    return;
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!from || !resendApiKey) {
    console.error("[submitLead] Missing EMAIL_FROM or RESEND_API_KEY. Skipping email send.", {
      hasEmailFrom: Boolean(from),
      hasResendApiKey: Boolean(resendApiKey),
    });
    return;
  }

  try {
    const response = await fetch(RESEND_EMAILS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[submitLead] Resend send failed.", {
        status: response.status,
        errorBody,
      });
      return;
    }

    console.info("[submitLead] Lead notification email sent.", { to: input.to });
  } catch (error) {
    console.error("[submitLead] Email send threw an error.", error);
  }
};

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("fly-client-ip") ??
    "unknown"
  );
};

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const previous = rateStore.get(ip) ?? [];
  const withinWindow = previous.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (withinWindow.length >= MAX_REQUESTS_PER_WINDOW) {
    rateStore.set(ip, withinWindow);
    return true;
  }

  withinWindow.push(now);
  rateStore.set(ip, withinWindow);
  return false;
};

const validatePayload = (input: unknown): { valid: true; payload: LeadPayload } | { valid: false; message: string } => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, message: "Payload inválido." };
  }

  const candidate = input as Record<string, unknown>;

  const payload: LeadPayload = {
    nombre: asTrimmedString(candidate.nombre),
    email: asTrimmedString(candidate.email).toLowerCase(),
    telefonoPais: asTrimmedString(candidate.telefonoPais),
    telefonoNumero: asTrimmedString(candidate.telefonoNumero),
    rol: asTrimmedString(candidate.rol),
    tamano: asTrimmedString(candidate.tamano),
    dolor: asTrimmedString(candidate.dolor),
    intereses: Array.isArray(candidate.intereses)
      ? candidate.intereses.map((item) => asTrimmedString(item)).filter(Boolean)
      : [],
    checklist: typeof candidate.checklist === "boolean" ? candidate.checklist : false,
    website: asTrimmedString(candidate.website),
    hp: asTrimmedString(candidate.hp),
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!payload.nombre) return { valid: false, message: "El nombre es obligatorio." };
  if (payload.nombre.length > 120) return { valid: false, message: "El nombre excede el máximo permitido." };

  if (!payload.email) return { valid: false, message: "El email es obligatorio." };
  if (!emailRegex.test(payload.email)) return { valid: false, message: "Formato de email inválido." };
  if (payload.email.length > 254) return { valid: false, message: "El email excede el máximo permitido." };

  if (payload.telefonoPais.length > 10) return { valid: false, message: "telefonoPais excede el máximo permitido." };

  if (payload.telefonoNumero.length > 24) return { valid: false, message: "telefonoNumero excede el máximo permitido." };

  if (!payload.rol) return { valid: false, message: "rol es obligatorio." };
  if (payload.rol.length > 40) return { valid: false, message: "rol excede el máximo permitido." };

  if (payload.tamano.length > 20) return { valid: false, message: "tamano excede el máximo permitido." };

  if (payload.dolor.length > 120) return { valid: false, message: "dolor excede el máximo permitido." };

  if (payload.telefonoPais && !payload.telefonoNumero) {
    return { valid: false, message: "telefonoNumero es obligatorio cuando se informa telefonoPais." };
  }

  if (!payload.telefonoPais && payload.telefonoNumero) {
    return { valid: false, message: "telefonoPais es obligatorio cuando se informa telefonoNumero." };
  }

  if (payload.intereses.length > 3) {
    return { valid: false, message: "intereses debe tener hasta 3 opciones." };
  }

  if (payload.intereses.some((item) => item.length > 120)) {
    return { valid: false, message: "Cada interés debe tener un largo válido." };
  }

  return { valid: true, payload };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return json(429, { ok: false, error: "Too many requests" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "JSON inválido." });
  }

  const validation = validatePayload(body);
  if (!validation.valid) {
    return json(400, { ok: false, error: validation.message });
  }

  const { payload } = validation;

  if (payload.website || payload.hp) {
    return json(200, { ok: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "Missing Supabase secrets." });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const source = "landing_comelu";
  const market = "Chile";
  const { data: insertedLead, error } = await supabase
    .from("leads")
    .insert({
      nombre: payload.nombre,
      email: payload.email,
      telefono_pais: payload.telefonoPais,
      telefono_numero: payload.telefonoNumero,
      rol: payload.rol,
      tamano: payload.tamano,
      dolor: payload.dolor,
      intereses: payload.intereses,
      checklist: payload.checklist,
      market,
      source,
    })
    .select("id")
    .single();

  if (error || !insertedLead) {
    return json(500, { ok: false, error: "No se pudo guardar el lead." });
  }

  const fallbackTo = payload.email;
  const configuredNotificationTo = asTrimmedString(Deno.env.get("LEAD_NOTIFICATION_TO"));
  const parsedRecipients = configuredNotificationTo ? parseEmailRecipients(configuredNotificationTo) : [];
  const recipients = parsedRecipients.length ? parsedRecipients : [fallbackTo];

  await sendLeadNotificationEmail({
    to: recipients,
    payload,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });

  return json(200, { ok: true });
});
