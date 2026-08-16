import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  AudienceSection,
  FaqSection,
  LandingFooter,
  ProblemsSection,
  TrustSection,
} from "@/components/landing/landing-sections";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingHeader } from "@/components/landing/landing-header";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import {
  INITIAL_FORM,
  PROBLEM_CARDS,
  type FieldErrors,
  type FormState,
  type InlineValidatableField,
  type Interest,
  type LabSize,
  type Role,
} from "@/components/landing/landing-data";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "light";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => boolean;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "comelu-turnstile-script";
const TURNSTILE_ACTION = "waitlist";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PATTERN = /^\+[1-9]\d+$/;

const EMPTY_FIELD_ERRORS: FieldErrors = {
  nombre: "",
  email: "",
  telefonoPais: "",
  telefonoNumero: "",
  rol: "",
  tamano: "",
  intereses: "",
};

function App() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [allowCarouselMotion, setAllowCarouselMotion] = useState(true);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_FIELD_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setAllowCarouselMotion(!mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!allowCarouselMotion) return undefined;
    const intervalId = window.setInterval(() => {
      setCurrentProblemIndex((previous) => (previous + 1) % PROBLEM_CARDS.length);
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [allowCarouselMotion]);

  useEffect(() => {
    if (!turnstileSiteKey) {
      setTurnstileError("No pudimos cargar la comprobación de seguridad. Intenta recargar la página.");
      return undefined;
    }

    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !turnstileContainerRef.current || turnstileWidgetIdRef.current || !window.turnstile) return;
      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: turnstileSiteKey,
        action: TURNSTILE_ACTION,
        theme: "light",
        callback: (token) => {
          setTurnstileToken(token);
          setTurnstileError("");
        },
        "expired-callback": () => {
          setTurnstileToken("");
          setTurnstileError("La comprobación de seguridad expiró. Complétala nuevamente.");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileError("No pudimos verificar la comprobación de seguridad. Intenta nuevamente.");
          return true;
        },
      });
    };

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");
    const onLoad = () => renderWidget();
    const onError = () => setTurnstileError("No pudimos cargar la comprobación de seguridad. Intenta recargar la página.");
    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.append(script);
    }
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    renderWidget();

    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (turnstileWidgetIdRef.current) {
        window.turnstile?.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey]);

  const scrollTo = (id: string, focusInput = false) => {
    const section = document.getElementById(id);
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (focusInput) window.setTimeout(() => firstInputRef.current?.focus(), reduceMotion ? 0 : 420);
  };

  const onWaitlistClick = () => scrollTo("lista-espera", true);

  const toggleInterest = (interest: Interest, checked: boolean) => {
    setForm((previous) => ({
      ...previous,
      intereses: checked
        ? previous.intereses.length >= 3
          ? previous.intereses
          : [...previous.intereses, interest]
        : previous.intereses.filter((item) => item !== interest),
    }));
  };

  const validateNombre = (value: string) =>
    value.trim().length < 2 ? "El nombre debe tener al menos 2 letras." : "";

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "El email es obligatorio.";
    return EMAIL_PATTERN.test(trimmed)
      ? ""
      : "Ingresa un email válido (ej: nombre@empresa.cl).";
  };

  const validateTelefono = (pais: string, numero: string) => {
    const paisTrimmed = pais.trim();
    const numeroTrimmed = numero.trim();
    if (!paisTrimmed && !numeroTrimmed) return { telefonoPais: "", telefonoNumero: "" };
    if (!paisTrimmed) {
      return { telefonoPais: "Selecciona un código de país si vas a dejar tu teléfono.", telefonoNumero: "" };
    }
    if (!numeroTrimmed) {
      return { telefonoPais: "", telefonoNumero: "Ingresa tu número de teléfono o deja ambos campos vacíos." };
    }
    const digitsOnly = numeroTrimmed.replace(/\D/g, "");
    const countryDigits = paisTrimmed.replace(/\D/g, "");
    const combined = `${paisTrimmed}${digitsOnly}`;
    if (!E164_PATTERN.test(combined) || countryDigits.length + digitsOnly.length !== 11) {
      return { telefonoPais: "", telefonoNumero: "El teléfono debe tener 11 dígitos en total (código país + número)." };
    }
    return { telefonoPais: "", telefonoNumero: "" };
  };

  const validateField = (field: InlineValidatableField, value: string) => {
    if (field === "nombre") return validateNombre(value);
    if (field === "email") return validateEmail(value);
    return validateTelefono(
      field === "telefonoPais" ? value : form.telefonoPais,
      field === "telefonoNumero" ? value : form.telefonoNumero,
    )[field];
  };

  const onFieldBlur = (field: InlineValidatableField) => {
    setFieldErrors((previous) => ({ ...previous, [field]: validateField(field, form[field]) }));
  };

  const onFieldChange = (field: InlineValidatableField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({ ...previous, [field]: validateField(field, value) }));
    }
  };

  const validate = () => {
    const nextErrors: FieldErrors = {
      nombre: validateNombre(form.nombre),
      email: validateEmail(form.email),
      ...validateTelefono(form.telefonoPais, form.telefonoNumero),
      rol: form.rol ? "" : "Selecciona una opción.",
      tamano: "",
      intereses: "",
    };
    setFieldErrors(nextErrors);
    const firstError =
      nextErrors.nombre || nextErrors.email || nextErrors.telefonoPais || nextErrors.telefonoNumero ||
      (nextErrors.rol ? "Selecciona un rol antes de enviar." : "");
    setFormError(firstError);
    return !firstError;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    setFormError("");
    if (!validate()) return;
    if (!turnstileToken) {
      setTurnstileError("Completa la comprobación de seguridad antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefonoPais: form.telefonoPais.trim(),
      telefonoNumero: form.telefonoNumero.trim(),
      rol: form.rol,
      tamano: form.tamano,
      intereses: form.intereses,
      otraNecesidad: form.otraNecesidad.trim(),
      checklist: form.checklist,
      turnstileToken,
    };
    const functionsBaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      if (!functionsBaseUrl || !anonKey) {
        setFormError("Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
        return;
      }
      const response = await fetch(`${functionsBaseUrl}/functions/v1/submitLead`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (import.meta.env.DEV) {
          const body = await response.text().catch(() => "");
          console.error("[submitLead] Non-OK response", { status: response.status, body });
        }
        setFormError("No pudimos guardar tu registro en este momento. Intenta nuevamente.");
        return;
      }
      setSubmitted(true);
      setForm(INITIAL_FORM);
      setFieldErrors(EMPTY_FIELD_ERRORS);
    } catch (error) {
      if (import.meta.env.DEV) console.error("[submitLead] Network error while sending lead", error);
      setFormError("No pudimos guardar tu registro en este momento. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
      setTurnstileToken("");
      if (turnstileWidgetIdRef.current) window.turnstile?.reset(turnstileWidgetIdRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader onNavigate={scrollTo} onWaitlist={onWaitlistClick} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <HeroSection onWaitlist={onWaitlistClick} onProblems={() => scrollTo("que-resuelve")} />
        <ProblemsSection
          currentIndex={currentProblemIndex}
          allowMotion={allowCarouselMotion}
          onSelect={setCurrentProblemIndex}
          onWaitlist={onWaitlistClick}
        />
        <AudienceSection onWaitlist={onWaitlistClick} />
        <TrustSection />
        <WaitlistSection
          form={form}
          fieldErrors={fieldErrors}
          formError={formError}
          turnstileError={turnstileError}
          submitted={submitted}
          isSubmitting={isSubmitting}
          firstInputRef={firstInputRef}
          turnstileContainerRef={turnstileContainerRef}
          onSubmit={onSubmit}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          onRoleChange={(rol: Role) => {
            setForm((previous) => ({ ...previous, rol }));
            if (fieldErrors.rol) setFieldErrors((previous) => ({ ...previous, rol: "" }));
          }}
          onSizeChange={(tamano: LabSize) => setForm((previous) => ({ ...previous, tamano }))}
          onInterestChange={toggleInterest}
          onNeedChange={(otraNecesidad) => setForm((previous) => ({ ...previous, otraNecesidad }))}
        />
        <FaqSection />
      </main>
      <LandingFooter onNavigate={scrollTo} onWaitlist={onWaitlistClick} />
    </div>
  );
}

export default App;
