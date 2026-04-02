import { buildLeadEmailTemplate } from "./emailTemplate.ts";
import { mkdir, writeFile } from "node:fs/promises";

const preview = buildLeadEmailTemplate({
  payload: {
    nombre: "Carla Morales",
    email: "carla.morales@biolabc.cl",
    telefonoPais: "+56",
    telefonoNumero: "987654321",
    rol: "Laboratorio dental",
    tamano: "11+ personas",
    intereses: ["Gestión de órdenes de trabajo", "Estados y seguimiento operativo", "Automatizaciones futuras"],
    otraNecesidad:
      "Nos gustaría centralizar mejor los requerimientos especiales de cada caso y detectar antes los cuellos de botella.",
    checklist: true,
  },
  metadata: {
    timestamp: new Date().toISOString(),
  },
});

await mkdir("./supabase/functions/submitLead/.preview", { recursive: true });
await writeFile("./supabase/functions/submitLead/.preview/lead-email-preview.html", preview.html, "utf8");
await writeFile("./supabase/functions/submitLead/.preview/lead-email-preview.txt", preview.text, "utf8");

console.info("Preview generated:");
console.info("- supabase/functions/submitLead/.preview/lead-email-preview.html");
console.info("- supabase/functions/submitLead/.preview/lead-email-preview.txt");
