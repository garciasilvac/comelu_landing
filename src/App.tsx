import { FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Menu,
  Send,
  Workflow,
  X,
} from "lucide-react";
import problema1Illustration from "./assets/illustrations/Problema_1.jpeg";
import problema2Illustration from "./assets/illustrations/Problema_2.png";
import problema3Illustration from "./assets/illustrations/Problema_3b.jpeg";
import problema4Illustration from "./assets/illustrations/Problema_4.jpeg";
import cliente1Illustration from "./assets/illustrations/Cliente_1.jpeg";
import cliente2Illustration from "./assets/illustrations/Cliente_2.jpeg";
import hero2Illustration from "./assets/illustrations/hero_2.png";

type Role =
  | ""
  | "Laboratorio dental"
  | "Laboratorista"
  | "Supervisor"
  | "Clínica con laboratorio propio"
  | "Dentista"
  | "Técnico dental";

type LabSize = "" | "1–3 personas" | "4–10 personas" | "11+ personas";

type Interest =
  | "Gestión de órdenes de trabajo"
  | "Archivos y documentos por caso"
  | "Estados y seguimiento operativo"
  | "Pagos, saldos y comprobantes"
  | "Reportes y métricas operativas"
  | "Automatizaciones futuras";

type FormState = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: Role;
  tamano: LabSize;
  intereses: Interest[];
  otraNecesidad: string;
  checklist: boolean;
};

type FieldErrors = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: string;
  tamano: string;
  intereses: string;
};

type InlineValidatableField = "nombre" | "email" | "telefonoPais" | "telefonoNumero";
type PlaceholderVariant = "default" | "hero" | "compact" | "audience";

const NAV_LINKS = [
  { id: "que-resuelve", label: "Qué queremos resolver" },
  { id: "para-quien", label: "Para quién" },
  { id: "faq", label: "FAQ" },
] as const;

const HERO_BULLETS = [
  "Una experiencia simple para ordenar órdenes y archivos por caso",
  "Un seguimiento moderno y amigable del estado de cada trabajo",
  "Más trazabilidad sin depender de WhatsApp, Excel o mensajes sueltos",
  "Cobros y comprobantes vinculados a cada orden de forma intuitiva",
] as const;

const PROBLEM_CARDS = [
  {
    title: "Información incompleta al iniciar una orden de trabajo dental",
    description:
      "Hoy faltan fotos, indicaciones, escaneos o detalles clínicos, y el caso parte con vacíos que después generan correcciones y retrasos. Comelu buscará ayudar a iniciar cada trabajo con más claridad desde el principio.",
    imageAlt: "Orden de trabajo dental con información faltante",
    imageSrc: problema1Illustration,
  },
  {
    title: "Archivos del caso repartidos entre WhatsApp, correo y teléfono",
    description:
      "Las imágenes, documentos y mensajes quedan dispersos y después cuesta saber qué corresponde realmente a cada trabajo. Queremos construir una forma más simple y amigable de reunir todo en un mismo contexto.",
    imageAlt: "Archivos de un caso dental dispersos en distintos canales",
    imageSrc: problema2Illustration,
  },
  {
    title: "Poca claridad sobre el estado del trabajo protésico",
    description:
      "Hay casos urgentes, atrasados o en producción, pero no siempre está claro en qué etapa va cada uno ni quién lo tiene asignado. La idea es que Comelu entregue una vista más intuitiva para seguir prioridades y responsables.",
    imageAlt: "Flujo de estados de trabajos protésicos en producción",
    imageSrc: problema3Illustration,
  },
  {
    title: "Pagos y comprobantes sin seguimiento simple",
    description:
      "Después cuesta revisar qué se pagó, qué falta por cobrar y qué comprobante corresponde a cada orden. Apuntamos a que esto también se pueda seguir de forma clara, moderna y sin fricción.",
    imageAlt: "Pagos y comprobantes vinculados a órdenes dentales",
    imageSrc: problema4Illustration,
  },
] as const;

const AUDIENCE_BLOCKS = [
  {
    title: "Laboratorios dentales",
    description:
      "Para laboratorios con equipo y flujo de trabajo distribuido",
    detail:
      "Si el trabajo pasa por distintas manos, queremos construir una herramienta que dé claridad sobre tareas, responsables, estados y comunicación sin perder trazabilidad.",
    icon: FlaskConical,
    placeholder: "Placeholder cliente 1: laboratorio dental",
  },
  {
    title: "Laboratorista independiente",
    description:
      "Para quienes hacen todo al mismo tiempo",
    icon: Workflow,
    detail:
      "Cuando una sola persona vende, produce, coordina y cobra, cada minuto importa. Comelu apunta a simplificar esa operación con una experiencia más ordenada, amable y fácil de seguir.",
    placeholder: "Placeholder cliente 2: laboratorista independiente",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "¿Qué es Comelu?",
    a: "Comelu es un software en construcción para laboratorios dentales que estamos diseñando para ordenar órdenes de trabajo, archivos, estados y pagos en un solo lugar.",
  },
  {
    q: "¿Para quién está pensado?",
    a: "Para laboratorios dentales, laboratoristas y clínicas dentales con laboratorio propio. También puede ser relevante para dentistas y técnicos dentales que coordinan trabajos con laboratorios.",
  },
  {
    q: "¿Comelu ya está disponible?",
    a: "Todavía no. Hoy estamos reuniendo interesados para contactar cuando abramos los primeros accesos y seguir priorizando funcionalidades.",
  },
  {
    q: "¿Sirve si hoy trabajamos con Excel y WhatsApp?",
    a: "Sí. Uno de los objetivos principales de Comelu es ayudar a reemplazar el desorden de planillas, mensajes y archivos dispersos por un flujo más claro, simple e intuitivo.",
  },
  {
    q: "¿Sirve para laboratorios pequeños?",
    a: "Sí. La idea es que sea útil tanto para laboratorios pequeños como para equipos más estructurados, siempre con foco en ordenar la operación diaria sin sumar complejidad.",
  },
  {
    q: "¿Sirve para clínicas dentales con laboratorio interno?",
    a: "Sí. Comelu también apunta a clínicas dentales que producen internamente trabajos protésicos y necesitan más control operativo.",
  },
] as const;

const INTERESES: Interest[] = [
  "Gestión de órdenes de trabajo",
  "Archivos y documentos por caso",
  "Estados y seguimiento operativo",
  "Pagos, saldos y comprobantes",
  "Reportes y métricas operativas",
  "Automatizaciones futuras",
];

const initialForm: FormState = {
  nombre: "",
  email: "",
  telefonoPais: "",
  telefonoNumero: "",
  rol: "",
  tamano: "",
  intereses: [],
  otraNecesidad: "",
  checklist: false,
};

const primaryButton =
  "interactive-cta inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#109d8f] to-[#22b8a8] px-5 py-3 text-sm font-semibold text-[#031016] shadow-[0_8px_24px_rgba(34,184,168,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(34,184,168,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]";

const secondaryButton =
  "interactive-cta inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]";

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center" data-reveal data-delay={80}>
      {eyebrow ? (
        <p className="section-eyebrow" data-reveal data-delay={100}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="section-title" data-reveal data-delay={120}>
        {title}
      </h2>
      <p className="section-copy mt-3" data-reveal data-delay={160}>
        {description}
      </p>
    </div>
  );
}

function PlaceholderVisual({
  label,
  title,
  detail,
  variant = "default",
  imageSrc,
}: {
  label: string;
  title: string;
  detail: string;
  variant?: PlaceholderVariant;
  imageSrc?: string;
}) {
  const getPlaceholderSpecs = (currentLabel: string, currentVariant: PlaceholderVariant) => {
    if (currentLabel.includes("hero principal")) {
      return {
        ratio: "4:5",
        desktop: "1200 x 1500 px",
        mobile: "960 x 1200 px",
      };
    }

    if (currentLabel.includes("Placeholder paso")) {
      return {
        ratio: "5:4",
        desktop: "1600 x 1280 px",
        mobile: "1200 x 960 px",
      };
    }

    if (currentLabel.includes("Placeholder cliente")) {
      return {
        ratio: "16:9",
        desktop: "1600 x 900 px",
        mobile: "1200 x 900 px",
      };
    }

    if (currentLabel.includes("credibilidad")) {
      return {
        ratio: "4:3",
        desktop: "1600 x 1200 px",
        mobile: "1200 x 900 px",
      };
    }

    if (currentVariant === "compact") {
      return {
        ratio: "4:3",
        desktop: "1200 x 900 px",
        mobile: "960 x 720 px",
      };
    }

    if (currentVariant === "audience") {
      return {
        ratio: "16:9",
        desktop: "1600 x 900 px",
        mobile: "1200 x 900 px",
      };
    }

    if (currentVariant === "hero") {
      return {
        ratio: "5:4",
        desktop: "1600 x 1280 px",
        mobile: "1200 x 960 px",
      };
    }

    return {
      ratio: "4:3",
      desktop: "1600 x 1200 px",
      mobile: "1200 x 900 px",
    };
  };

  const specs = getPlaceholderSpecs(label, variant);

  return (
    <div
      className={`placeholder-card placeholder-${variant} ${imageSrc ? "image-placeholder" : ""}`}
      data-reveal
      data-delay={120}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={label} className="placeholder-image" />
      ) : (
        <>
          <p className="placeholder-label">{label}</p>
          <p className="placeholder-title">{title}</p>
          <p className="placeholder-detail">{detail}</p>
          <div className="placeholder-specs" aria-label="Especificaciones recomendadas de imagen">
            <span>Ratio {specs.ratio}</span>
            <span>Desktop {specs.desktop}</span>
            <span>Mobile {specs.mobile}</span>
          </div>
          <div className="placeholder-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [allowCarouselMotion, setAllowCarouselMotion] = useState(true);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    nombre: "",
    email: "",
    telefonoPais: "",
    telefonoNumero: "",
    rol: "",
    tamano: "",
    intereses: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const year = new Date().getFullYear();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setAllowCarouselMotion(!mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!allowCarouselMotion) return undefined;

    const intervalId = window.setInterval(() => {
      setCurrentProblemIndex((prev) => (prev + 1) % PROBLEM_CARDS.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [allowCarouselMotion]);

  const scrollTo = (id: string, focusInput = false) => {
    const section = document.getElementById(id);
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

    if (focusInput) {
      window.setTimeout(() => {
        firstInputRef.current?.focus();
      }, reduceMotion ? 0 : 420);
    }
  };

  const onWaitlistClick = () => {
    scrollTo("lista-espera", true);
    setMobileMenuOpen(false);
  };

  const goToProblemSlide = (index: number) => {
    setCurrentProblemIndex(index);
  };

  const toggleInterest = (interest: Interest, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      intereses: checked
        ? prev.intereses.length >= 3
          ? prev.intereses
          : [...prev.intereses, interest]
        : prev.intereses.filter((item) => item !== interest),
    }));
  };

  const validateNombre = (value: string) => {
    if (value.trim().length < 2) return "El nombre debe tener al menos 2 letras.";
    return "";
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "El email es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return "Ingresa un email válido (ej: nombre@empresa.cl).";
    return "";
  };

  const validateTelefono = (pais: string, numero: string) => {
    const paisTrimmed = pais.trim();
    const numeroTrimmed = numero.trim();

    if (!paisTrimmed && !numeroTrimmed) {
      return {
        telefonoPais: "",
        telefonoNumero: "",
      };
    }

    if (!paisTrimmed) {
      return {
        telefonoPais: "Selecciona un código de país si vas a dejar tu teléfono.",
        telefonoNumero: "",
      };
    }

    if (!numeroTrimmed) {
      return {
        telefonoPais: "",
        telefonoNumero: "Ingresa tu número de teléfono o deja ambos campos vacíos.",
      };
    }

    const digitsOnly = numeroTrimmed.replace(/\D/g, "");
    const countryDigits = paisTrimmed.replace(/\D/g, "");
    const totalDigits = countryDigits.length + digitsOnly.length;
    const combined = `${paisTrimmed}${digitsOnly}`;
    const e164Regex = /^\+[1-9]\d+$/;

    if (!e164Regex.test(combined) || totalDigits !== 11) {
      return {
        telefonoPais: "",
        telefonoNumero: "El teléfono debe tener 11 dígitos en total (código país + número).",
      };
    }

    return {
      telefonoPais: "",
      telefonoNumero: "",
    };
  };

  const validateField = (field: InlineValidatableField, value: string) => {
    if (field === "nombre") return validateNombre(value);
    if (field === "email") return validateEmail(value);
    const telefonoValidation = validateTelefono(
      field === "telefonoPais" ? value : form.telefonoPais,
      field === "telefonoNumero" ? value : form.telefonoNumero,
    );
    return telefonoValidation[field];
  };

  const onFieldBlur = (field: InlineValidatableField) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  };

  const onFieldChange = (field: InlineValidatableField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
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

    if (nextErrors.nombre) {
      setFormError(nextErrors.nombre);
      return false;
    }

    if (nextErrors.email) {
      setFormError(nextErrors.email);
      return false;
    }

    if (nextErrors.telefonoPais) {
      setFormError(nextErrors.telefonoPais);
      return false;
    }

    if (nextErrors.telefonoNumero) {
      setFormError(nextErrors.telefonoNumero);
      return false;
    }

    if (nextErrors.rol) {
      setFormError("Selecciona un rol antes de enviar.");
      return false;
    }

    setFormError("");
    return true;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    setFormError("");

    if (!validate()) return;

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
    };

    const functionsBaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!functionsBaseUrl || !anonKey) {
      setFormError("Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
      setIsSubmitting(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch(`${functionsBaseUrl}/functions/v1/submitLead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[submitLead] Network error while sending lead", error);
      }
      setFormError("No pudimos guardar tu registro en este momento. Intenta nuevamente.");
      setIsSubmitting(false);
      return;
    }

    if (!response.ok) {
      if (import.meta.env.DEV) {
        const errorBody = await response.text().catch(() => "");
        console.error("[submitLead] Non-OK response", {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
      }
      setFormError("No pudimos guardar tu registro en este momento. Intenta nuevamente.");
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
    setForm(initialForm);
    setFieldErrors({
      nombre: "",
      email: "",
      telefonoPais: "",
      telefonoNumero: "",
      rol: "",
      tamano: "",
      intereses: "",
    });
  };

  return (
    <div className="page-shell min-h-screen text-slate-950">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a1623]/84 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 text-white sm:gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a1629] text-sm font-semibold text-[#8efaf0] sm:h-10 sm:w-10">
              C
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight sm:text-lg">Comelu</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                className="transition duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#109d8f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1623]"
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onWaitlistClick} className={`${primaryButton} hidden sm:inline-flex`}>
              Lista de espera
            </button>
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-0 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-white/[0.08] hover:text-white lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-[#0a1623]/95 px-4 py-2.5 lg:hidden">
            <div className="mx-auto flex max-w-[1160px] flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/6 hover:text-white"
                  onClick={() => {
                    scrollTo(link.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                className="interactive-cta mt-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#11a79b] to-[#7be0d4] px-4 py-2.5 text-sm font-semibold text-[#04131a] shadow-[0_12px_28px_-18px_rgba(17,167,155,0.6)]"
                onClick={onWaitlistClick}
              >
                Lista de espera
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-[1160px] px-4 pb-20 sm:px-6 lg:px-8">
        <section
          className="full-bleed-dark-section hero-panel scroll-mt-28"
          data-reveal
          style={{ ["--hero-image" as string]: `url(${hero2Illustration})` }}
        >
          <div className="hero-panel-inner">
            <div className="hero-grid">
              <div data-reveal data-delay={80}>
              <p
                className="mb-4 inline-flex rounded-full border border-[#2dd4bf]/40 bg-[#2dd4bf]/12 px-3 py-1 text-xs font-semibold tracking-wide text-[#81fff2]"
                data-reveal
                data-delay={120}
              >
                Software para laboratorios dentales en Chile
              </p>
              <h1
                className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl"
                data-reveal
                data-delay={160}
              >
                El Software que cambiará la gestión del laboratorio dental 
              </h1>
              <p className="mt-5 max-w-3xl text-base text-slate-300 sm:text-lg" data-reveal data-delay={220}>
                Organiza órdenes, archivos, estados y pagos. Sin depender de Excel, WhatsApp o
                mensajes sueltos
              </p>
              <p className="mt-4 max-w-3xl text-sm text-slate-400 sm:text-base" data-reveal data-delay={260}>
                Construiremos la solución para el problema real del rubro en Chile. Será simple, amigable y
                con trazabilidad clara para seguir cada caso fácilmente.
              </p>

              <ul className="mt-6 grid gap-3 text-sm text-slate-200 sm:text-base" data-reveal data-delay={300}>
                {HERO_BULLETS.map((item, index) => (
                  <li key={item} className="flex items-start gap-2" data-reveal data-delay={320 + index * 40}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#56f3e2]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onWaitlistClick}
                  className={`${primaryButton} w-full sm:w-auto`}
                  data-reveal
                  data-delay={0}
                >
                  Unirme a la lista de espera
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("que-resuelve")}
                  className={`${secondaryButton} w-full sm:w-auto`}
                  data-reveal
                  data-delay={40}
                >
                  Ver lo que buscamos resolver
                </button>
              </div>
              <p className="mt-3 text-center text-sm text-slate-400">
                Déjanos tus datos y te contactaremos cuando abramos los primeros accesos y espacios de validación.
              </p>
              </div>
            </div>
          </div>
        </section>

        <section id="que-resuelve" className="section-block scroll-mt-28" data-reveal>
          <SectionIntro
            title="Lo que buscamos resolver con Comelu"
            description="Muchos laboratorios dentales y clínicas con producción propia todavía gestionan órdenes, archivos, estados y cobros en varios canales al mismo tiempo. Estamos creando Comelu para simplificar esos puntos de fricción con una experiencia más clara, moderna y trazable."
          />
          <div className="content-carousel panel-frame mt-8 overflow-hidden" data-reveal data-delay={80}>
            <div className="overflow-hidden">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${currentProblemIndex * 100}%)`,
                  transition: allowCarouselMotion ? "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                }}
              >
                {PROBLEM_CARDS.map((item) => (
                  <article key={item.title} className="problem-carousel-slide min-w-full">
                    <img src={item.imageSrc} alt={item.imageAlt} className="problem-carousel-image" />
                    <div className="problem-carousel-overlay">
                      <div className="problem-carousel-copy">
                        <h3 className="problem-card-title text-2xl font-semibold text-white sm:text-3xl">
                          {item.title}
                        </h3>
                        <p className="problem-card-description mt-3 text-sm leading-7 text-slate-100 sm:text-base sm:leading-8">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6">
              <div className="carousel-progress" aria-label={`Indicador del problema ${currentProblemIndex + 1}`}>
                {PROBLEM_CARDS.map((item, progressIndex) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => goToProblemSlide(progressIndex)}
                    className={`carousel-progress-segment ${progressIndex === currentProblemIndex ? "is-active" : ""}`}
                    aria-label={`Ir al problema ${progressIndex + 1}: ${item.title}`}
                    aria-current={progressIndex === currentProblemIndex ? "step" : undefined}
                  >
                    <span
                      className={`carousel-progress-fill ${
                        progressIndex === currentProblemIndex && allowCarouselMotion ? "is-animated" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="section-cta-row mt-8" data-reveal data-delay={140}>
            <button type="button" onClick={onWaitlistClick} className={primaryButton}>
              Quiero sumarme temprano
            </button>
          </div>
        </section>

        <section id="para-quien" className="section-block pb-14 scroll-mt-28 lg:pb-20" data-reveal>
          <SectionIntro
            title="Lo estamos creando para equipos que viven este desorden de cerca"
            description="Comelu se está diseñando para quienes producen, coordinan o supervisan trabajos protésicos dentales y necesitan una herramienta simple, moderna y amigable para ordenar casos, archivos y pagos."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {AUDIENCE_BLOCKS.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="glass-card interactive-card flex h-full flex-col"
                  data-reveal
                  data-delay={index * 80}
                >
                  <PlaceholderVisual
                    label={item.placeholder}
                    title="Imagen del cliente potencial"
                    detail="Reemplazar con visual editorial del perfil descrito."
                    variant="audience"
                    imageSrc={index === 0 ? cliente1Illustration : index === 1 ? cliente2Illustration : undefined}
                  />
                  <div className="mt-4 flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#109d8f]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950 lg:text-lg">{item.title}</h3>
                      <p className="mt-1.5 text-sm font-medium leading-6 text-slate-700">{item.description}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="section-cta-row mt-8" data-reveal data-delay={140}>
            <button type="button" onClick={onWaitlistClick} className={primaryButton}>
              Quiero recibir novedades del lanzamiento
            </button>
          </div>
        </section>

        <section className="section-block scroll-mt-28" data-reveal>
          <SectionIntro
            title="Estamos construyendo Comelu desde la operación real del laboratorio dental"
            description="No queremos hacer un software dental genérico. Buscamos construir una herramienta enfocada en la gestión del laboratorio dental: órdenes de trabajo, archivos, seguimiento, pagos y coordinación diaria."
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div data-reveal data-delay={80} className="h-full">
              <PlaceholderVisual
                label="Placeholder credibilidad o contexto de laboratorio"
                title="Imagen de credibilidad"
                detail="Espacio para entorno de laboratorio dental o composición entre interfaz y contexto real."
              />
            </div>
            <div data-reveal data-delay={120} className="glass-card flex h-full flex-col justify-center">
              <p className="section-copy">
                La meta es construir un software simple, moderno, amigable e intuitivo para laboratorios dentales en
                Chile, basado en problemas reales del flujo protésico y no en funciones desconectadas de la operación.
              </p>
            </div>
          </div>
        </section>

        <section id="lista-espera" className="full-bleed-dark-section waitlist-section section-block scroll-mt-28">
          <div className="panel-frame dark-panel p-6 sm:p-8" data-reveal data-delay={0}>
            <SectionIntro
              title="Únete temprano y ayúdanos a construir el software para laboratorio dental que el rubro realmente necesita"
              description="Déjanos tus datos para contactarte cuando abramos primeros accesos, entrevistas o instancias de validación del producto."
            />

            <form className="mt-8 grid gap-8" onSubmit={onSubmit} noValidate data-reveal data-delay={60}>
              <section className="grid gap-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">Datos principales</h3>
                  <p className="mt-1 text-sm text-slate-400">Campos obligatorios para sumarte a la lista de espera.</p>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="grid gap-2 lg:col-span-1">
                    <label htmlFor="nombre" className="field-label">
                      Nombre
                    </label>
                    <input
                      ref={firstInputRef}
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => onFieldChange("nombre", e.target.value)}
                      onBlur={() => onFieldBlur("nombre")}
                      placeholder="Ej: Carlos González"
                      aria-invalid={Boolean(fieldErrors.nombre)}
                      aria-describedby="nombre-help nombre-error"
                      className="field"
                    />
                    {fieldErrors.nombre ? (
                      <p id="nombre-error" className="text-xs text-rose-300">
                        {fieldErrors.nombre}
                      </p>
                    ) : (
                      <p id="nombre-help" className="text-xs text-slate-400">
                        Escribe tu nombre y apellido.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2 lg:col-span-1">
                    <label htmlFor="email" className="field-label">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => onFieldChange("email", e.target.value)}
                      onBlur={() => onFieldBlur("email")}
                      placeholder="nombre@empresa.cl"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby="email-help email-error"
                      className="field"
                    />
                    {fieldErrors.email ? (
                      <p id="email-error" className="text-xs text-rose-300">
                        {fieldErrors.email}
                      </p>
                    ) : (
                      <p id="email-help" className="text-xs text-slate-400">
                        Formato esperado: nombre@empresa.cl
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2 lg:col-span-1">
                    <label htmlFor="rol" className="field-label">
                      Rol
                    </label>
                    <div className="relative">
                      <select
                        id="rol"
                        name="rol"
                        required
                        value={form.rol}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, rol: e.target.value as Role }));
                          if (fieldErrors.rol) setFieldErrors((prev) => ({ ...prev, rol: "" }));
                        }}
                        aria-invalid={Boolean(fieldErrors.rol)}
                        className="field w-full appearance-none border-white/25 bg-gradient-to-b from-white/10 to-white/[0.03] pr-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      >
                        <option className="bg-[#0b1222] text-slate-100" value="">
                          Selecciona
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="Laboratorio dental">
                          Laboratorio dental
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="Laboratorista">
                          Laboratorista
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="Supervisor">
                          Supervisor
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="Clínica con laboratorio propio">
                          Clínica con laboratorio propio
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="Dentista">
                          Dentista
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="Técnico dental">
                          Técnico dental
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    {fieldErrors.rol ? (
                      <p className="text-xs text-rose-300">{fieldErrors.rol}</p>
                    ) : (
                      <p className="text-xs text-slate-400">Selecciona el perfil que mejor te representa.</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="grid gap-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">Cuéntanos más</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Campos opcionales para ayudarnos a priorizar mejor el producto.
                  </p>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-2">
                  <div className="phone-field grid gap-2">
                    <label htmlFor="telefono-pais" className="field-label">
                      Teléfono
                    </label>
                    <div className="phone-grid grid gap-2 sm:grid-cols-[140px_1fr]">
                      <div className="relative">
                        <select
                          id="telefono-pais"
                          name="telefonoPais"
                          value={form.telefonoPais}
                          onChange={(e) => onFieldChange("telefonoPais", e.target.value)}
                          onBlur={() => onFieldBlur("telefonoPais")}
                          aria-invalid={Boolean(fieldErrors.telefonoPais)}
                          aria-describedby="telefono-help telefono-pais-error telefono-numero-error"
                          className="field w-full appearance-none pr-9"
                        >
                          <option className="bg-[#0b1222] text-slate-100" value="">
                            País
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+56">
                            Chile (+56)
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+54">
                            Argentina (+54)
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+57">
                            Colombia (+57)
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+51">
                            Perú (+51)
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+52">
                            México (+52)
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+1">
                            EE.UU./Canadá (+1)
                          </option>
                          <option className="bg-[#0b1222] text-slate-100" value="+34">
                            España (+34)
                          </option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>

                      <input
                        id="telefono-numero"
                        name="telefonoNumero"
                        type="tel"
                        value={form.telefonoNumero}
                        onChange={(e) => onFieldChange("telefonoNumero", e.target.value)}
                        onBlur={() => onFieldBlur("telefonoNumero")}
                        placeholder="9 1234 5678"
                        aria-invalid={Boolean(fieldErrors.telefonoNumero)}
                        aria-describedby="telefono-help telefono-pais-error telefono-numero-error"
                        className="field"
                      />
                    </div>

                    {fieldErrors.telefonoPais ? (
                      <p id="telefono-pais-error" className="text-xs text-rose-300">
                        {fieldErrors.telefonoPais}
                      </p>
                    ) : null}
                    {fieldErrors.telefonoNumero ? (
                      <p id="telefono-numero-error" className="text-xs text-rose-300">
                        {fieldErrors.telefonoNumero}
                      </p>
                    ) : null}
                    {!fieldErrors.telefonoPais && !fieldErrors.telefonoNumero ? (
                      <p id="telefono-help" className="text-xs text-slate-400">
                        Opcional. Si lo dejas, usa el formato país + número.
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2 self-start">
                    <label htmlFor="tamano" className="field-label">
                      Tamaño del laboratorio / equipo
                    </label>
                    <div className="relative">
                      <select
                        id="tamano"
                        name="tamano"
                        value={form.tamano}
                        onChange={(e) => setForm((prev) => ({ ...prev, tamano: e.target.value as LabSize }))}
                        className="field w-full appearance-none border-white/25 bg-gradient-to-b from-white/10 to-white/[0.03] pr-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      >
                        <option className="bg-[#0b1222] text-slate-100" value="">
                          Selecciona
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="1–3 personas">
                          1–3 personas
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="4–10 personas">
                          4–10 personas
                        </option>
                        <option className="bg-[#0b1222] text-slate-100" value="11+ personas">
                          11+ personas
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <fieldset className="lg:col-span-2">
                    <legend className="mb-4 block text-lg font-semibold text-white">
                      Intereses / funcionalidades
                      <span className="mt-1 block text-sm font-medium text-slate-300">(opcional, máximo 3)</span>
                    </legend>
                    <div className="interest-grid grid gap-2 sm:grid-cols-2">
                      {INTERESES.map((interest) => (
                        <label
                          key={interest}
                          className={`group flex items-start gap-3 rounded-xl border p-3 text-sm transition duration-300 ${
                            form.intereses.includes(interest)
                              ? "border-[#2dd4bf]/70 bg-[#2dd4bf]/12 text-white shadow-[0_10px_30px_-18px_rgba(45,212,191,0.7)]"
                              : "border-white/15 bg-white/[0.03] text-slate-200 hover:border-[#2dd4bf]/55 hover:bg-white/[0.07]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="intereses"
                            checked={form.intereses.includes(interest)}
                            disabled={!form.intereses.includes(interest) && form.intereses.length >= 3}
                            onChange={(e) => toggleInterest(interest, e.target.checked)}
                            className="mt-0.5 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-white/35 bg-slate-950/70 transition before:block before:h-4 before:w-4 before:translate-x-[1px] before:translate-y-[1px] before:rounded-full before:bg-white/80 before:content-[''] checked:border-[#2dd4bf] checked:bg-[#2dd4bf]/30 checked:before:translate-x-[17px] checked:before:bg-[#2dd4bf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]"
                          />
                          <span className="transition group-hover:text-white">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid gap-2 lg:col-span-2">
                    <label htmlFor="otra-necesidad" className="field-label">
                      ¿Hay alguna otra necesidad que te gustaría que Comelu resolviera?
                    </label>
                    <textarea
                      id="otra-necesidad"
                      name="otraNecesidad"
                      rows={5}
                      maxLength={2000}
                      value={form.otraNecesidad}
                      onChange={(e) => setForm((prev) => ({ ...prev, otraNecesidad: e.target.value }))}
                      placeholder="Cuéntanos cualquier necesidad, problema o idea que te gustaría resolver con la app"
                      className="field min-h-[140px] resize-y"
                    />
                    <p className="text-xs text-slate-400">Opcional. Puedes contarnos cualquier idea o problema adicional.</p>
                  </div>
                </div>
              </section>

              <input type="hidden" name="checklist" value={form.checklist ? "true" : "false"} />

              {formError ? <p className="text-sm text-rose-300">{formError}</p> : null}
              {submitted ? (
                <p className="text-sm text-emerald-300">
                  Te contactaremos cuando haya novedades relevantes, primeros accesos o instancias de validación del
                  producto.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto ${primaryButton}`}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Quiero unirme a la lista de espera"}
                </button>
                <p className="text-sm text-slate-400">
                  Te contactaremos cuando haya novedades relevantes, primeros accesos o instancias de validación del
                  producto.
                </p>
              </div>
            </form>
          </div>
        </section>

        <section id="faq" className="section-block scroll-mt-28" data-reveal>
          <SectionIntro
            title="Preguntas frecuentes sobre Comelu"
            description="Respuestas breves para entender qué estamos construyendo, para quién lo estamos creando y cómo puedes sumarte temprano."
          />
          <div className="faq-list mt-6">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = faqOpenIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <article
                  key={item.q}
                  className="faq-item"
                  data-reveal
                  data-delay={index * 70}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="faq-trigger flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-inset"
                      onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    >
                      {item.q}
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    className={`faq-panel text-sm text-slate-600 ${isOpen ? "is-open" : ""}`}
                  >
                    <div className="faq-panel-inner pb-4 pr-8">{item.a}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-white/10 bg-[#0a1623]">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white">Comelu</p>
            <p className="mt-1 text-sm text-slate-400">Comelu — Software en construcción para laboratorios dentales</p>
            <p className="mt-1 text-sm text-slate-500">© {year} Comelu. Todos los derechos reservados.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <button type="button" onClick={() => scrollTo("que-resuelve")} className="transition hover:text-white">
              Problemas
            </button>
            <button type="button" onClick={() => scrollTo("para-quien")} className="transition hover:text-white">
              Para quién
            </button>
            <button type="button" onClick={() => scrollTo("faq")} className="transition hover:text-white">
              FAQ
            </button>
            <button type="button" onClick={onWaitlistClick} className="transition hover:text-white">
              Lista de espera
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
