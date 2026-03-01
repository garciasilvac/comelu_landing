import { createClient } from "npm:@supabase/supabase-js@2";

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

  if (!payload.telefonoPais) return { valid: false, message: "telefonoPais es obligatorio." };
  if (payload.telefonoPais.length > 10) return { valid: false, message: "telefonoPais excede el máximo permitido." };

  if (!payload.telefonoNumero) return { valid: false, message: "telefonoNumero es obligatorio." };
  if (payload.telefonoNumero.length > 24) return { valid: false, message: "telefonoNumero excede el máximo permitido." };

  if (!payload.rol) return { valid: false, message: "rol es obligatorio." };
  if (payload.rol.length > 40) return { valid: false, message: "rol excede el máximo permitido." };

  if (!payload.tamano) return { valid: false, message: "tamano es obligatorio." };
  if (payload.tamano.length > 20) return { valid: false, message: "tamano excede el máximo permitido." };

  if (!payload.dolor) return { valid: false, message: "dolor es obligatorio." };
  if (payload.dolor.length > 120) return { valid: false, message: "dolor excede el máximo permitido." };

  if (payload.intereses.length < 1 || payload.intereses.length > 3) {
    return { valid: false, message: "intereses debe tener entre 1 y 3 opciones." };
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

  const { error } = await supabase.from("leads").insert({
    nombre: payload.nombre,
    email: payload.email,
    telefono_pais: payload.telefonoPais,
    telefono_numero: payload.telefonoNumero,
    rol: payload.rol,
    tamano: payload.tamano,
    dolor: payload.dolor,
    intereses: payload.intereses,
    checklist: payload.checklist,
    market: "Chile",
    source: "landing_comelu",
  });

  if (error) {
    return json(500, { ok: false, error: "No se pudo guardar el lead." });
  }

  return json(200, { ok: true });
});
