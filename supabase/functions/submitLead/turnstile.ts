export const TURNSTILE_WAITLIST_ACTION = "waitlist";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const ALWAYS_PASS_DUMMY_SECRET = "1x0000000000000000000000000000000AA";
const LOCAL_DEVELOPMENT_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

type SiteverifyResult = {
  success?: unknown;
  action?: unknown;
  hostname?: unknown;
};

type TurnstileValidationInput = {
  token: string;
  secret: string | undefined;
  expectedAction: string;
  expectedHostnames: Set<string>;
  remoteIp?: string;
  allowDummyTestMode?: boolean;
};

export type TurnstileValidationResult =
  | { valid: true }
  | { valid: false; reason: "missing_token" | "invalid_token" | "configuration_error" | "verification_error" };

export const parseTurnstileHostnames = (value: string | undefined) =>
  new Set(
    (value ?? "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );

export const canUseDummyTestMode = (input: {
  enabled: boolean;
  secret: string | undefined;
  expectedHostnames: Set<string>;
}) =>
  input.enabled &&
  input.secret === ALWAYS_PASS_DUMMY_SECRET &&
  input.expectedHostnames.size > 0 &&
  [...input.expectedHostnames].every((hostname) => LOCAL_DEVELOPMENT_HOSTNAMES.has(hostname));

export const validateTurnstile = async ({
  token,
  secret,
  expectedAction,
  expectedHostnames,
  remoteIp,
  allowDummyTestMode = false,
}: TurnstileValidationInput): Promise<TurnstileValidationResult> => {
  if (!token || token.length > 2048) {
    return { valid: false, reason: "missing_token" };
  }

  if (!secret || expectedHostnames.size === 0) {
    return { valid: false, reason: "configuration_error" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let result: SiteverifyResult;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body,
    });

    if (!response.ok) throw new Error(`siteverify ${response.status}`);
    result = await response.json();
  } catch {
    return { valid: false, reason: "verification_error" };
  }

  if (result.success !== true) {
    return { valid: false, reason: "invalid_token" };
  }

  if (allowDummyTestMode && secret === ALWAYS_PASS_DUMMY_SECRET) {
    return { valid: true };
  }

  if (
    result.action !== expectedAction ||
    typeof result.hostname !== "string" ||
    !expectedHostnames.has(result.hostname)
  ) {
    return { valid: false, reason: "invalid_token" };
  }

  return { valid: true };
};
