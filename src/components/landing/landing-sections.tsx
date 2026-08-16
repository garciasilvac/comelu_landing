import { CheckCircleIcon, SparkleIcon } from "@phosphor-icons/react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { landingHeroImages } from "@/lib/landingAssets";
import { AUDIENCE_BLOCKS, FAQ_ITEMS, HERO_BULLETS, NAV_LINKS, PROBLEM_CARDS } from "./landing-data";

type ActionProps = {
  onWaitlist: () => void;
};

export function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center" data-reveal>
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

export function HeroSection({ onWaitlist, onProblems }: ActionProps & { onProblems: () => void }) {
  return (
    <section
      className="hero-panel full-bleed-dark-section scroll-mt-24"
      data-reveal
      style={{
        ["--hero-image-desktop" as string]: `url(${landingHeroImages.desktop})`,
        ["--hero-image-mobile" as string]: `url(${landingHeroImages.mobile})`,
      }}
    >
      <div className="hero-panel-inner">
        <div className="hero-grid">
          <div className="hero-copy" data-reveal>
            <Badge variant="outline" className="border-primary/50 bg-primary/15 text-sky-100">
              Software para laboratorios dentales en Chile
            </Badge>
            <h1 className="mt-5 max-w-4xl font-heading text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              El Software que cambiará la gestión del laboratorio dental
            </h1>
            <p className="mt-5 max-w-3xl text-base text-slate-200 sm:text-lg">
              Organiza órdenes, archivos, estados y pagos. Sin depender de Excel, WhatsApp o mensajes sueltos
            </p>
            <p className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-base">
              Construiremos la solución para el problema real del rubro en Chile. Será simple, amigable y con
              trazabilidad clara para seguir cada caso fácilmente.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-slate-100 sm:text-base">
              {HERO_BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 shrink-0 text-amber-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" size="lg" className="w-full sm:w-auto" onClick={onWaitlist}>
                Unirme a la lista de espera
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto"
                onClick={onProblems}
              >
                Ver lo que buscamos resolver
              </Button>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Déjanos tus datos y te contactaremos cuando abramos los primeros accesos y espacios de validación.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProblemsSection({
  currentIndex,
  allowMotion,
  onSelect,
  onWaitlist,
}: ActionProps & {
  currentIndex: number;
  allowMotion: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <section id="que-resuelve" className="section-block scroll-mt-24" data-reveal>
      <SectionIntro
        title="Lo que buscamos resolver con Comelu"
        description="Muchos laboratorios dentales y clínicas con producción propia todavía gestionan órdenes, archivos, estados y cobros en varios canales al mismo tiempo. Estamos creando Comelu para simplificar esos puntos de fricción con una experiencia más clara, moderna y trazable."
      />
      <Card className="mt-8 py-0 shadow-sm" data-reveal>
        <CardContent className="overflow-hidden px-0">
          <div className="overflow-hidden">
            <div
              className="flex"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: allowMotion ? "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
              }}
            >
              {PROBLEM_CARDS.map((item) => (
                <article key={item.title} className="problem-carousel-slide min-w-full">
                  <img src={item.imageSrc} alt={item.imageAlt} className="problem-carousel-image" />
                  <div className="problem-carousel-overlay">
                    <div className="problem-carousel-copy">
                      <h3 className="font-heading text-2xl font-semibold leading-snug text-white sm:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-100 sm:text-base">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="carousel-progress" aria-label={`Indicador del problema ${currentIndex + 1}`}>
              {PROBLEM_CARDS.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={`carousel-progress-segment ${index === currentIndex ? "is-active" : ""}`}
                  aria-label={`Ir al problema ${index + 1}: ${item.title}`}
                  aria-current={index === currentIndex ? "step" : undefined}
                >
                  <span className={`carousel-progress-fill ${index === currentIndex && allowMotion ? "is-animated" : ""}`} />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 flex justify-center">
        <Button type="button" size="lg" onClick={onWaitlist}>Quiero sumarme temprano</Button>
      </div>
    </section>
  );
}

export function AudienceSection({ onWaitlist }: ActionProps) {
  return (
    <section id="para-quien" className="section-block scroll-mt-24" data-reveal>
      <SectionIntro
        title="Lo estamos creando para equipos que viven este desorden de cerca"
        description="Comelu se está diseñando para quienes producen, coordinan o supervisan trabajos protésicos dentales y necesitan una herramienta simple, moderna y amigable para ordenar casos, archivos y pagos."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {AUDIENCE_BLOCKS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="transition-transform hover:-translate-y-1" data-reveal>
              <img src={item.imageSrc} alt={item.imageAlt} className="aspect-video w-full object-cover" />
              <CardHeader>
                <div className="mb-2 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="font-medium text-foreground/80">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="leading-6 text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center">
        <Button type="button" size="lg" onClick={onWaitlist}>Quiero recibir novedades del lanzamiento</Button>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="section-block" data-reveal>
      <SectionIntro
        title="Estamos construyendo Comelu desde la operación real del laboratorio dental"
        description="No queremos hacer un software dental genérico. Buscamos construir una herramienta enfocada en la gestión del laboratorio dental: órdenes de trabajo, archivos, seguimiento, pagos y coordinación diaria."
      />
      <Card className="mt-8 bg-sky-50/70 py-0 dark:bg-card" data-reveal>
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex min-h-56 items-center justify-center bg-primary p-8 text-primary-foreground">
            <div className="text-center">
              <SparkleIcon className="mx-auto size-10 text-amber-300" />
              <p className="mt-4 font-heading text-xl font-semibold">Diseñado con el rubro</p>
            </div>
          </div>
          <CardContent className="flex items-center p-8">
            <p className="text-base leading-8 text-muted-foreground">
              La meta es construir un software simple, moderno, amigable e intuitivo para laboratorios dentales en
              Chile, basado en problemas reales del flujo protésico y no en funciones desconectadas de la operación.
            </p>
          </CardContent>
        </div>
      </Card>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="section-block scroll-mt-24" data-reveal>
      <SectionIntro
        title="Preguntas frecuentes sobre Comelu"
        description="Respuestas breves para entender qué estamos construyendo, para quién lo estamos creando y cómo puedes sumarte temprano."
      />
      <Card className="mx-auto mt-8 max-w-4xl">
        <CardContent>
          <Accordion defaultValue={["faq-0"]}>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent className="pr-8 text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}

export function LandingFooter({ onNavigate, onWaitlist }: ActionProps & { onNavigate: (id: string) => void }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-sky-800/40 bg-sky-700 text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
        <div>
          <img src="/comelu-horizontal.svg" alt="Comelu" className="h-auto w-32 sm:w-36" />
          <p className="mt-1 text-sm text-sky-100">Software en construcción para laboratorios dentales</p>
          <p className="mt-1 text-sm text-sky-200/80">© {year} Comelu. Todos los derechos reservados.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Navegación del pie">
          {NAV_LINKS.map((link) => (
            <Button key={link.id} type="button" variant="ghost" className="text-sky-50 hover:bg-white/15 hover:text-white focus-visible:ring-white/60" onClick={() => onNavigate(link.id)}>
              {link.id === "que-resuelve" ? "Problemas" : link.label}
            </Button>
          ))}
          <Separator orientation="vertical" className="mx-1 hidden h-5 bg-white/20 sm:block" />
          <Button type="button" variant="ghost" className="text-amber-200 hover:bg-white/15 hover:text-amber-100 focus-visible:ring-white/60" onClick={onWaitlist}>
            Lista de espera
          </Button>
        </nav>
      </div>
    </footer>
  );
}
