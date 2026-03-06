import { buildLeadEmailTemplate } from "./emailTemplate.ts";
import { mkdir, writeFile } from "node:fs/promises";

const preview = buildLeadEmailTemplate({
  payload: {
    nombre: "Carla Morales",
    email: "carla.morales@biolabc.cl",
    telefonoPais: "+56",
    telefonoNumero: "987654321",
    rol: "Jefa de laboratorio",
    tamano: "11-25 personas",
    dolor: "Nos cuesta mantener trazabilidad de muestras y estado de reactivos en tiempo real.",
    intereses: ["Trazabilidad completa", "Alertas de stock", "Reportes operativos"],
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
