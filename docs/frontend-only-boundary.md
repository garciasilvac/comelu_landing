# Frontera frontend-only de `comelu_landing`

## Decisión de ownership

`comelu_landing` es únicamente el frontend público de Comelu. `comelu-app` posee el backend Supabase compartido, incluyendo migraciones SQL, funciones runtime, configuración backend, secretos y despliegues. La landing no mantiene una segunda cadena de migraciones ni implementa el runtime que atiende la waitlist.

La frontera se aplica como una regla técnica del repositorio: no se aceptan artefactos bajo `supabase/`, configuración backend ni scripts server-side o de correo. El guard `pnpm test:frontend-only` y la CI verifican esta regla en cada cambio.

## Contrato público conservado

El comportamiento del frontend no cambia:

- el formulario valida y protege el registro con Turnstile;
- el navegador envía un `POST` a `${VITE_SUPABASE_URL}/functions/v1/submitLead`;
- el cliente usa `VITE_SUPABASE_ANON_KEY` para los headers públicos de la llamada;
- `VITE_TURNSTILE_SITE_KEY` configura el widget público;
- el payload, la acción `waitlist`, el copy y las pruebas del frontend permanecen bajo ownership de la landing.

Estas variables son configuración pública de cliente. No se deben agregar credenciales server-side a ningún ejemplo `.env` ni al bundle.

El código runtime sólo puede leer estas claves mediante `import.meta.env`:

- variables públicas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`;
- built-ins documentados de Vite: `DEV`, `PROD`, `MODE`, `BASE_URL`, `SSR`.

El guard rechaza cualquier otra lectura con acceso por punto o corchetes, así como cualquier nombre `VITE_*` no incluido en esta lista.

El directorio `scripts/` mantiene una allowlist estrecha para tooling frontend: `check-frontend-only.mjs` y `generate-web-icons.mjs`. Los scripts de backend, correo o migraciones no pertenecen a este repositorio.

## Histórico SQL reconciliado

El SQL histórico está reconciliado en `comelu-app` como:

`comelu-app/supabase/migrations/20260819030134_integrate_comelu_leads.sql`

Ese archivo representa la reconciliación del historial de una DDL existente. No debe copiarse, aplicarse ni reaplicarse desde `comelu_landing`. Cualquier cambio futuro de base de datos se realiza en `comelu-app`, con su validación y autorización independientes; la landing sólo consume un contrato compatible ya publicado.

## Validación local y CI

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

`pnpm test` ejecuta primero el guard de frontera y después la suite Vitest. La CI repite instalación con lockfile, test y build para bloquear la reintroducción accidental de backend.
