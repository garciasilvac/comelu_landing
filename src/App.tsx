import { FormEvent, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ClipboardCheck,
  Files,
  Menu,
  Send,
  ShieldCheck,
  Wallet,
  Workflow,
  X,
} from "lucide-react";
import heroIllustration from "./assets/illustrations/hero.png";
import retrabajosIllustration from "./assets/illustrations/retrabajos.png";

type Role = "" | "Laboratorista" | "Supervisor" | "Dueño";
type LabSize = "" | "1–3" | "4–10" | "10+";
type MainPain =
  | ""
  | "Información incompleta"
  | "Archivos perdidos"
  | "Estados confusos"
  | "Pagos sin trazabilidad";

type Interest =
  | "Órdenes + estados por etapa"
  | "Archivos adjuntos por caso"
  | "Pagos/saldos + comprobantes (transferencia)"
  | "Notificaciones a clientes"
  | "Reportes básicos (atrasos, carga de trabajo)"
  | "Acceso para clientes (link de seguimiento)";

type FormState = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: Role;
  tamano: LabSize;
  dolor: MainPain;
  intereses: Interest[];
  checklist: boolean;
};

type FieldErrors = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: string;
  tamano: string;
  dolor: string;
  intereses: string;
};

type InlineValidatableField = "nombre" | "email" | "telefonoPais" | "telefonoNumero";

const NAV_LINKS = [
  { id: "problemas", label: "Problemas" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "primera-version", label: "Primera versión" },
  { id: "faq", label: "FAQ" },
];

const PROBLEMAS = [
  {
    title: "Información incompleta",
    description: "Retrabajos y vueltas innecesarias",
    icon: ClipboardCheck,
  },
  {
    title: "Archivos perdidos",
    description: "Fotos, escaneos e indicaciones en mil chats",
    icon: Files,
  },
  {
    title: "Estados confusos",
    description: "Nadie sabe con certeza ‘en qué va’ cada caso",
    icon: Workflow,
  },
  {
    title: "Pagos sin trazabilidad",
    description: "Saldos y comprobantes dispersos",
    icon: Wallet,
  },
] as const;

const INTERESES: Interest[] = [
  "Órdenes + estados por etapa",
  "Archivos adjuntos por caso",
  "Pagos/saldos + comprobantes (transferencia)",
  "Notificaciones a clientes",
  "Reportes básicos (atrasos, carga de trabajo)",
  "Acceso para clientes (link de seguimiento)",
];

const FAQ = [
  {
    q: "¿Sirve para laboratorios pequeños?",
    a: "Sí. Parte simple y escala por etapas.",
  },
  {
    q: "¿Puedo recibir órdenes desde clientes?",
    a: "Sí, con un link/formulario de recepción.",
  },
  {
    q: "¿Cómo se maneja el pago por transferencia?",
    a: "Registro de pago, comprobante y saldo por orden/cliente.",
  },
  {
    q: "¿Qué pasa con los archivos?",
    a: "Quedan asociados a la orden para evitar pérdidas.",
  },
  {
    q: "¿Cuándo lanzan?",
    a: "Pilotos por cupos en Chile. Únete a la lista de espera para ser de los primeros.",
  },
] as const;

const initialForm: FormState = {
  nombre: "",
  email: "",
  telefonoPais: "+56",
  telefonoNumero: "",
  rol: "",
  tamano: "",
  dolor: "",
  intereses: [],
  checklist: false,
};

const primaryButton =
  "rounded-xl bg-gradient-to-r from-[#109d8f] to-[#22b8a8] px-5 py-3 text-sm font-semibold text-[#031016] shadow-[0_8px_24px_rgba(34,184,168,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(34,184,168,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]";

const secondaryButton =
  "rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    nombre: "",
    email: "",
    telefonoPais: "",
    telefonoNumero: "",
    rol: "",
    tamano: "",
    dolor: "",
    intereses: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const year = useMemo(() => new Date().getFullYear(), []);

  const scrollTo = (id: string, focusInput = false) => {
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });

    if (focusInput) {
      window.setTimeout(() => {
        firstInputRef.current?.focus();
      }, 420);
    }
  };

  const onChecklistClick = () => {
    setForm((prev) => {
      const withInterest: Interest[] = prev.intereses.includes("Órdenes + estados por etapa")
        ? prev.intereses
        : [...prev.intereses, "Órdenes + estados por etapa"];

      return {
        ...prev,
        checklist: true,
        intereses: withInterest,
      };
    });

    scrollTo("lista-espera", true);
  };

  const onWaitlistClick = () => {
    scrollTo("lista-espera", true);
    setMobileMenuOpen(false);
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
    const numeroTrimmed = numero.trim();
    if (!pais) {
      return {
        telefonoPais: "Selecciona un código de país.",
        telefonoNumero: "",
      };
    }
    if (!numeroTrimmed) {
      return {
        telefonoPais: "",
        telefonoNumero: "Ingresa tu número de teléfono.",
      };
    }

    const digitsOnly = numeroTrimmed.replace(/\D/g, "");
    const countryDigits = pais.replace(/\D/g, "");
    const totalDigits = countryDigits.length + digitsOnly.length;
    const combined = `${pais}${digitsOnly}`;
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
      tamano: form.tamano ? "" : "Selecciona una opción.",
      dolor: form.dolor ? "" : "Selecciona una opción.",
      intereses: form.intereses.length > 0 ? "" : "Selecciona al menos una opción.",
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

    if (nextErrors.tamano) {
      setFormError("Selecciona el tamaño del laboratorio antes de enviar.");
      return false;
    }

    if (nextErrors.dolor) {
      setFormError("Selecciona el dolor principal antes de enviar.");
      return false;
    }

    if (nextErrors.intereses) {
      setFormError("Selecciona al menos una opción en “Qué te interesa más”.");
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
      telefonoPais: form.telefonoPais,
      telefonoNumero: form.telefonoNumero.trim(),
      rol: form.rol,
      tamano: form.tamano,
      dolor: form.dolor,
      intereses: form.intereses,
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
        },
        body: JSON.stringify(payload),
      });
    } catch {
      setFormError("No pudimos guardar tu registro en este momento. Intenta nuevamente.");
      setIsSubmitting(false);
      return;
    }

    if (!response.ok) {
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
      dolor: "",
      intereses: "",
    });
  };

  return (
    <div className="page-shell min-h-screen text-white">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070c19]/65 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#" className="text-lg font-semibold tracking-tight text-white">
            Comelu
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                className="transition duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]"
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onWaitlistClick} className={primaryButton}>
              Unirme a la lista de espera
            </button>
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-lg border border-white/20 bg-white/5 p-0 text-white transition hover:bg-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#070c19]/95 px-4 py-3 lg:hidden">
            <div className="mx-auto flex max-w-[1160px] flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className="rounded-md px-2 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
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
                className="mt-1 rounded-xl bg-gradient-to-r from-[#109d8f] to-[#22b8a8] px-3 py-3 text-center text-sm font-semibold text-[#031016] shadow-[0_8px_24px_rgba(34,184,168,0.24)] transition duration-300 hover:shadow-[0_12px_30px_rgba(34,184,168,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]"
                onClick={onWaitlistClick}
              >
                Unirme a la lista de espera
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1160px] px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <section className="hero-panel panel-frame reveal">
          <div className="hero-grid">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-[#2dd4bf]/40 bg-[#2dd4bf]/12 px-3 py-1 text-xs font-semibold tracking-wide text-[#81fff2]">
                Hecho para laboratorios dentales en Chile
              </p>
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                Software para órdenes, archivos y pagos del laboratorio dental.{" "}
                <span className="text-gradient">Sin Excel ni WhatsApp desordenado.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base text-slate-300 sm:text-lg">
                Comelu centraliza pedidos, adjuntos, estados por etapa y cobros para laboratorios dentales en Chile, con trazabilidad por caso y seguimiento para cada cliente.
              </p>

              <ul className="mt-6 grid gap-3 text-sm text-slate-200 sm:text-base">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#56f3e2]" />
                  <span>Estados por etapa: recepción → diseño → producción → despacho</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#56f3e2]" />
                  <span>Archivos siempre asociados a la orden (escaneos, fotos, docs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#56f3e2]" />
                  <span>Pagos y saldos: seguimiento simple y comprobantes</span>
                </li>
              </ul>

              <div className="hero-cta mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={onWaitlistClick} className={`${primaryButton} w-full justify-center sm:w-auto`}>
                  Unirme a la lista de espera
                </button>
                <button type="button" onClick={onChecklistClick} className={`${secondaryButton} w-full justify-center sm:w-auto`}>
                  Recibir checklist gratis
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-400">Pilotos por cupos en Chile. Te avisamos primero.</p>
            </div>

            <aside className="glass-card floating-card reveal" style={{ animationDelay: "120ms" }}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Operación en vivo</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Control total del flujo diario</h3>
              <img src={heroIllustration} alt="Panel hero de Comelu" className="mt-3 h-[24.5rem] w-full rounded-lg object-cover" />
              <p className="mt-4 rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-slate-300">
                Detecta cuellos de botella y atrasos antes de que impacten tu entrega.
              </p>
            </aside>
          </div>
        </section>

        <section id="problemas" className="section-block reveal">
          <h2 className="section-title">Problemas operativos que hoy hacen perder tiempo (y plata)</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {PROBLEMAS.map((item, index) => {
              return (
                <article
                  key={item.title}
                  className="glass-card interactive-card reveal min-h-[280px]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                  <img
                    src={retrabajosIllustration}
                    alt="Retrabajos por información incompleta"
                    className="mt-4 h-64 w-full rounded-lg object-contain"
                  />
                </article>
              );
            })}
          </div>
        </section>

        <section id="como-funciona" className="section-block reveal">
          <h2 className="section-title">Cómo funciona el flujo del laboratorio dental en Comelu</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="glass-card interactive-card reveal" style={{ animationDelay: "0ms" }}>
              <div className="flex w-full items-start gap-3">
                <div className="step-pill self-center">1</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Recibe el caso</h3>
                  <p className="mt-1 text-sm text-slate-300">Cliente, fecha entrega, indicaciones y adjuntos.</p>
                </div>
              </div>
            </article>
            <article className="glass-card interactive-card reveal" style={{ animationDelay: "90ms" }}>
              <div className="flex w-full items-start gap-3">
                <div className="step-pill self-center translate-y-px">
                  <span className="leading-none">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Trabaja por etapas</h3>
                  <p className="mt-1 text-sm text-slate-300">Responsable, estado, alertas y checklist.</p>
                </div>
              </div>
            </article>
            <article className="glass-card interactive-card reveal" style={{ animationDelay: "180ms" }}>
              <div className="flex w-full items-start gap-3">
                <div className="step-pill self-center">3</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Entrega y cobra</h3>
                  <p className="mt-1 text-sm text-slate-300">Saldo, comprobantes y seguimiento de pagos.</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="primera-version" className="section-block reveal">
          <h2 className="section-title">Primera versión del software: lo esencial para operar</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="glass-card reveal" style={{ animationDelay: "0ms" }}>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Órdenes de trabajo (rápida y detallada)</li>
                <li>• Archivos y adjuntos centralizados por orden</li>
                <li>• Estados por etapa y responsables</li>
                <li>• Registro de pagos / saldo / comprobante (transferencia)</li>
                <li>• Historial y trazabilidad por caso</li>
                <li>• Notificaciones básicas (email + link de seguimiento)</li>
              </ul>
            </article>
            <article className="glass-card reveal" style={{ animationDelay: "100ms" }}>
              <h3 className="font-semibold text-white">Aún no (por ahora)</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                <li>• Integración automática con bancos / facturación</li>
                <li>• Reportería avanzada</li>
                <li>• Automatizaciones complejas</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="section-block reveal">
          <h2 className="section-title">Próximas mejoras del sistema, definidas contigo</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Partimos resolviendo lo más crítico: órdenes, archivos, estados y pagos. Luego sumamos automatizaciones, reportes e integraciones. Al unirte a la lista de espera, marcas tus prioridades y eso define qué sale antes.
          </p>
        </section>

        <section className="section-block reveal">
          <h2 className="section-title">Comelu nace desde la operación real del laboratorio dental</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Comelu está desarrollada por un trabajador de laboratorio dental, para laboratoristas, supervisores y dueños de laboratorios. Nace de problemas reales: pedidos incompletos, archivos perdidos, estados confusos y pagos sin seguimiento.
          </p>
          <p className="mt-2 text-sm text-slate-400">Hecho para el día a día en Chile.</p>
        </section>

        <section id="lista-espera" className="section-block reveal">
          <div className="panel-frame p-6 sm:p-8">
            <h2 className="section-title">Lista de espera: sé de los primeros en probar Comelu</h2>
            <p className="mt-3 max-w-3xl text-slate-300">
              Estamos armando un grupo piloto para laboratorios dentales en Chile. Déjanos tus datos y te contactamos cuando abramos nuevos cupos.
            </p>

            <form className="mt-6 grid gap-5" onSubmit={onSubmit} noValidate>
              <div className="grid gap-2">
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

              <div className="form-grid grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="email" className="field-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
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
                      Selecciona país y escribe el número sin código. Ej: +56 9 1234 5678
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="meta-grid grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <label htmlFor="rol" className="field-label">
                    Rol
                  </label>
                  <div className="relative">
                    <select
                      id="rol"
                      name="rol"
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
                      <option className="bg-[#0b1222] text-slate-100" value="Laboratorista">
                        Laboratorista
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="Supervisor">
                        Supervisor
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="Dueño">
                        Dueño
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {fieldErrors.rol && <p className="text-xs text-rose-300">{fieldErrors.rol}</p>}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="tamano" className="field-label">
                    Tamaño del laboratorio
                  </label>
                  <div className="relative">
                    <select
                      id="tamano"
                      name="tamano"
                      value={form.tamano}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, tamano: e.target.value as LabSize }));
                        if (fieldErrors.tamano) setFieldErrors((prev) => ({ ...prev, tamano: "" }));
                      }}
                      aria-invalid={Boolean(fieldErrors.tamano)}
                      className="field w-full appearance-none border-white/25 bg-gradient-to-b from-white/10 to-white/[0.03] pr-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    >
                      <option className="bg-[#0b1222] text-slate-100" value="">
                        Selecciona
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="1–3">
                        1–3
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="4–10">
                        4–10
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="10+">
                        10+
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {fieldErrors.tamano && <p className="text-xs text-rose-300">{fieldErrors.tamano}</p>}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="dolor" className="field-label">
                    Dolor principal
                  </label>
                  <div className="relative">
                    <select
                      id="dolor"
                      name="dolor"
                      value={form.dolor}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, dolor: e.target.value as MainPain }));
                        if (fieldErrors.dolor) setFieldErrors((prev) => ({ ...prev, dolor: "" }));
                      }}
                      aria-invalid={Boolean(fieldErrors.dolor)}
                      className="field w-full appearance-none border-white/25 bg-gradient-to-b from-white/10 to-white/[0.03] pr-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    >
                      <option className="bg-[#0b1222] text-slate-100" value="">
                        Selecciona
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="Información incompleta">
                        Información incompleta
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="Archivos perdidos">
                        Archivos perdidos
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="Estados confusos">
                        Estados confusos
                      </option>
                      <option className="bg-[#0b1222] text-slate-100" value="Pagos sin trazabilidad">
                        Pagos sin trazabilidad
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {fieldErrors.dolor && <p className="text-xs text-rose-300">{fieldErrors.dolor}</p>}
                </div>
              </div>

              <fieldset className="grid">
                <legend className={`mb-4 block text-center text-lg font-semibold sm:text-left ${fieldErrors.intereses ? "text-rose-300" : "text-white"}`}>
                  ¿Qué te interesa más?
                  <span className="block text-sm font-medium text-slate-300">(máximo 3 opciones)</span>
                </legend>
                <div className={`interest-grid grid gap-2 sm:grid-cols-2 ${fieldErrors.intereses ? "rounded-xl border border-rose-400/70 p-2" : ""}`}>
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
                        onChange={(e) => {
                          toggleInterest(interest, e.target.checked);
                          if (fieldErrors.intereses) {
                            setFieldErrors((prev) => ({ ...prev, intereses: "" }));
                          }
                        }}
                        className="mt-0.5 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full border border-white/35 bg-slate-950/70 transition before:block before:h-4 before:w-4 before:translate-x-[1px] before:translate-y-[1px] before:rounded-full before:bg-white/80 before:content-[''] checked:border-[#2dd4bf] checked:bg-[#2dd4bf]/30 checked:before:translate-x-[17px] checked:before:bg-[#2dd4bf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c19]"
                      />
                      <span className="transition group-hover:text-white">{interest}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.intereses && <p className="mt-2 text-xs text-rose-300">{fieldErrors.intereses}</p>}
              </fieldset>

              <input type="hidden" name="checklist" value={form.checklist ? "true" : "false"} />

              {formError && <p className="text-sm text-rose-300">{formError}</p>}
              {submitted && <p className="text-sm text-emerald-300">Gracias. Te agregamos a la lista de espera de Comelu.</p>}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto ${primaryButton}`}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Unirme a la lista de espera"}
                </button>
                <p className="text-sm text-slate-400">Sin spam. Solo te contactamos para el piloto/lanzamiento.</p>
              </div>
            </form>
          </div>
        </section>

        <section id="faq" className="section-block reveal">
          <h2 className="section-title">FAQ</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((item, index) => {
              const isOpen = faqOpenIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <article key={item.q} className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-sm transition hover:bg-white/[0.06]">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf] focus-visible:ring-inset"
                      onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    >
                      {item.q}
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="border-t border-white/10 px-5 py-4 text-sm text-slate-300">
                    {item.a}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-white/10 bg-[#060b16]/70">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white">Comelu</p>
            <p className="text-sm text-slate-400">© {year} Comelu. Todos los derechos reservados.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <a href="#" className="transition hover:text-white">
              Privacidad
            </a>
            <a href="mailto:contacto@comelu.cl" className="transition hover:text-white">
              Contacto
            </a>
            <button type="button" onClick={onWaitlistClick} className="font-semibold text-slate-200 transition hover:text-[#64ffe9]">
              Lista de espera
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
