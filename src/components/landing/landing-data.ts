import { FlaskIcon, FlowArrowIcon } from "@phosphor-icons/react";

import cliente1Illustration from "@/assets/illustrations/Cliente_1.jpeg";
import cliente2Illustration from "@/assets/illustrations/Cliente_2.jpeg";
import problema1Illustration from "@/assets/illustrations/Problema_1.jpeg";
import problema2Illustration from "@/assets/illustrations/Problema_2.png";
import problema3Illustration from "@/assets/illustrations/Problema_3b.jpeg";
import problema4Illustration from "@/assets/illustrations/Problema_4.jpeg";

export type Role =
  | ""
  | "Laboratorio dental"
  | "Laboratorista"
  | "Supervisor"
  | "Clínica con laboratorio propio"
  | "Dentista"
  | "Técnico dental";

export type LabSize = "" | "1–3 personas" | "4–10 personas" | "11+ personas";

export type Interest =
  | "Gestión de órdenes de trabajo"
  | "Archivos y documentos por caso"
  | "Estados y seguimiento operativo"
  | "Pagos, saldos y comprobantes"
  | "Reportes y métricas operativas"
  | "Automatizaciones futuras";

export type FormState = {
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

export type FieldErrors = {
  nombre: string;
  email: string;
  telefonoPais: string;
  telefonoNumero: string;
  rol: string;
  tamano: string;
  intereses: string;
};

export type InlineValidatableField = "nombre" | "email" | "telefonoPais" | "telefonoNumero";

export const NAV_LINKS = [
  { id: "que-resuelve", label: "Qué queremos resolver" },
  { id: "para-quien", label: "Para quién" },
  { id: "faq", label: "FAQ" },
] as const;

export const PROBLEM_CARDS = [
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

export const AUDIENCE_BLOCKS = [
  {
    title: "Laboratorios dentales",
    description: "Para laboratorios con equipo y flujo de trabajo distribuido",
    detail:
      "Si el trabajo pasa por distintas manos, queremos construir una herramienta que dé claridad sobre tareas, responsables, estados y comunicación sin perder trazabilidad.",
    icon: FlaskIcon,
    imageSrc: cliente1Illustration,
    imageAlt: "Equipo trabajando en un laboratorio dental",
  },
  {
    title: "Laboratorista independiente",
    description: "Para quienes hacen todo al mismo tiempo",
    detail:
      "Cuando una sola persona vende, produce, coordina y cobra, cada minuto importa. Comelu apunta a simplificar esa operación con una experiencia más ordenada, amable y fácil de seguir.",
    icon: FlowArrowIcon,
    imageSrc: cliente2Illustration,
    imageAlt: "Laboratorista dental independiente trabajando",
  },
] as const;

export const FAQ_ITEMS = [
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

export const INTERESTS: Interest[] = [
  "Gestión de órdenes de trabajo",
  "Archivos y documentos por caso",
  "Estados y seguimiento operativo",
  "Pagos, saldos y comprobantes",
  "Reportes y métricas operativas",
  "Automatizaciones futuras",
];

export const INITIAL_FORM: FormState = {
  nombre: "",
  email: "",
  telefonoPais: "+56",
  telefonoNumero: "",
  rol: "",
  tamano: "",
  intereses: [],
  otraNecesidad: "",
  checklist: false,
};
