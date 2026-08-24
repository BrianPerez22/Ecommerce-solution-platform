# Plan de acción — Reestructurar Sanddy Almacén para Azure

**Objetivo:** dejar el proyecto funcional y listo para desplegar en Azure, resolviendo las incompatibilidades entre el plan original (Azure Functions + Cosmos DB + Next.js) y lo que realmente está construido (Fastify + PostgreSQL + Vite).

**Punto de partida:** el proyecto ya funciona en local (backend + frontend + Postgres en Docker). Este plan no reescribe lo que funciona, solo lo adapta para que sea desplegable en la nube.

> **Estado:** todas las fases (0 a 6) están completadas. Ver [`despliegue-azure.md`](../apps/despliegue-azure.md) para el detalle de qué se implementó en el código fase por fase, y [`como-desplegar.md`](../apps/como-desplegar.md) para la guía práctica de despliegue.

---

## Fase 0 — Principio de diseño (ya decidido)

Se mantiene el stack actual: **Fastify + PostgreSQL + Vite**. Se abandona formalmente el plan de Cosmos DB / Azure Functions / Next.js — reescribir esas tres capas no da ningún beneficio funcional nuevo, y Azure tiene servicios que soportan el stack actual sin refactor (App Service, Azure Database for PostgreSQL, Static Web Apps). El SEO/OpenGraph de Next.js queda descartado por ahora: el flujo principal del negocio es WhatsApp directo, no búsqueda orgánica.

**Regla para todas las fases siguientes: el proyecto debe seguir funcionando 100% en local (Docker + `npm run dev`) durante y después de cada cambio.** Nada se hace "solo para Azure" de forma que rompa el flujo local que ya tienes funcionando. La forma de lograr esto es que cada integración nueva (Blob Storage, Postgres de Azure, etc.) se controle por **variables de entorno**, con un valor por defecto que siga usando lo local:

- Local: Postgres en Docker (`sanddy-db`) + imágenes en disco (`apps/Back/uploads`).
- Producción: Postgres de Azure + imágenes en Blob Storage.
- El código de la aplicación no debería tener ramas de tipo `if (isAzure)` — la diferencia vive solo en qué valores tiene el `.env`, no en el código.

Esto significa que cada fase de abajo se construye y se **prueba primero en local**, y solo al final se apunta a los recursos reales de Azure.

---

## Fase 1 — Imágenes: de disco local a Azure Blob Storage
**Por qué:** en la nube el almacenamiento en disco del servidor no es persistente ni compartido entre instancias; si el backend se reinicia o escala, las imágenes subidas se pierden. Este cambio es necesario sin importar qué se decida en las otras fases.

- [x] Crear una cuenta de Storage en Azure y un contenedor Blob para imágenes de producto.
- [x] Instalar el SDK de Azure Storage en el backend (`@azure/storage-blob`).
- [x] Modificar `apps/Back/src/routes/uploads.ts` para que revise una variable de entorno (ej. `STORAGE_DRIVER=local|azure`): si es `local`, sigue guardando en `apps/Back/uploads` como hoy; si es `azure`, sube al Blob Storage. Por defecto en desarrollo queda en `local`, así nada cambia mientras trabajas en tu Mac.
- [x] Actualizar el modelo `Producto.imagenes` (Prisma) para guardar una URL (ya sea la ruta local servida por `@fastify/static`, o la URL pública del blob) — el frontend no necesita saber cuál es cuál.
- [x] Confirmar que `ProductCard.tsx`, `ProductForm.tsx`, `admin/image.ts` ya consumen esa URL tal cual viene del backend (sin necesidad de tocarlos si el backend siempre devuelve una URL completa).
- [x] Probar primero en local con `STORAGE_DRIVER=local` (como ya funciona hoy) y luego, aparte, probar con `STORAGE_DRIVER=azure` apuntando a un contenedor de prueba, sin tocar tu entorno de desarrollo diario.

---

## Fase 2 — Base de datos: Postgres local (Docker) → Azure Database for PostgreSQL
**Por qué:** el schema de Prisma es 100% relacional; no tiene sentido migrarlo a Cosmos DB (NoSQL) porque implicaría rehacer todo el modelo de datos. Azure sí ofrece PostgreSQL administrado, compatible sin tocar el schema.

- [x] Crear una instancia de Azure Database for PostgreSQL (flexible server) — esto es un recurso nuevo en Azure, no reemplaza tu `sanddy-db` local en Docker; conviven ambos.
- [x] Configurar reglas de firewall/red para que el backend pueda conectarse.
- [x] Crear un **segundo archivo** de entorno, por ejemplo `.env.production` (o configurar las variables directamente en Azure App Service — ver Fase 3), con la `DATABASE_URL` de Azure. Tu `.env` local con `DATABASE_URL` apuntando a Docker se queda intacto y sigue siendo el que usas con `npm run dev`.
- [x] Correr `npx prisma migrate deploy` (no `migrate dev`) contra la base de datos de Azure para aplicar las mismas migraciones que ya corriste en local — el `schema.prisma` no cambia, solo el destino.
- [x] Decidir cómo se sembrarán los datos iniciales en producción (correr `seed.ts` una sola vez, manualmente, apuntando a Azure).
- [x] Verificar que las variables `ADMIN_INITIAL_USERNAME` / `ADMIN_INITIAL_PASSWORD` en `.env.production` no queden con los valores de desarrollo (`sanddy` / `sanddy2026`).

---

## Fase 3 — Backend: Fastify → Azure App Service
**Por qué:** Fastify es un servidor de larga duración; forzarlo a Azure Functions (serverless) implicaría reescribir cada ruta como función independiente. Azure App Service permite correr el servidor Node/Fastify tal cual, sin ese refactor.

- [x] Confirmar que `npm run build` genera `dist/` correctamente y `npm run start` corre el server compilado (ya existen estos scripts en `package.json`).
- [x] Crear el recurso Azure App Service (plan Linux, runtime Node 20 — coincide con lo que ya usas).
- [x] Configurar variables de entorno de producción en App Service (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, credenciales de Blob Storage, etc.) — nunca subir `.env` al repo.
- [x] Configurar el pipeline de despliegue (GitHub Actions o Azure DevOps) para hacer build y deploy del backend a App Service.
- [x] Ajustar `CORS_ORIGIN` para que apunte al dominio real del frontend en producción (no `localhost:5173`).
- [x] Probar `/health` contra la URL pública de producción.

---

## Fase 4 — Frontend: Vite → Azure Static Web Apps
**Por qué:** Vite genera una SPA está compilada, y Azure Static Web Apps la soporta sin necesidad de Next.js. Este paso solo cambia si en la Fase 0 se decide que el SEO es imprescindible (ahí habría que evaluar migrar a Next.js antes de esta fase).

- [x] Confirmar `npm run build` genera el `dist/` estático correctamente.
- [x] Crear el recurso Azure Static Web Apps y conectarlo al repositorio.
- [x] Configurar `VITE_API_URL` de producción apuntando a la URL del backend en App Service.
- [x] Configurar el pipeline de build/deploy (Azure suele generarlo automático vía GitHub Actions al conectar el repo).
- [x] Probar el catálogo público y el panel `/admin` contra las URLs reales de producción.

---

## Fase 5 — Seguridad antes de salir a producción
**Por qué:** varias configuraciones actuales son válidas solo para desarrollo local.

- [x] Generar un `JWT_SECRET` fuerte y único para producción (no dejar `dev-secret-cambiar-en-produccion`).
- [x] Cambiar usuario/contraseña de admin sembrados por defecto.
- [x] Revisar y resolver las 3 vulnerabilidades "high" reportadas por `npm audit` en el backend.
- [x] Confirmar que las cookies de sesión usan `secure: true` y `sameSite` apropiado en producción (HTTPS).
- [x] Revisar límites de tamaño/tipo de archivo en la subida de imágenes (`multipart`), para evitar abuso del Blob Storage.

---

## Fase 6 — Actualizar documentación
**Por qué:** los docs actuales (`docs/planificacion/roadmap-proyecto.md`) describen una arquitectura que ya no corresponde al proyecto real, lo que genera confusión (como la que motivó este plan).

- [x] Actualizar `roadmap-proyecto.md` con el stack real (Fastify + PostgreSQL + Vite + Azure App Service/Static Web Apps/Blob Storage).
- [x] Documentar en `docs/apps/` cómo desplegar (equivalente a `como-correr.md` pero para producción).
- [x] Dejar constancia explícita de por qué se abandonó Cosmos DB / Azure Functions / Next.js, para que futuras personas no repitan la confusión.

---

## Orden recomendado de ejecución

1. Fase 0 (decisión) → 2. Fase 1 (imágenes) → 3. Fase 2 (base de datos) → 4. Fase 3 (backend) → 5. Fase 4 (frontend) → 6. Fase 5 (seguridad) → 7. Fase 6 (documentación)

Las fases 1 y 2 se pueden hacer en paralelo si hay dos personas trabajando. Las fases 3 y 4 dependen de que 1 y 2 estén listas (para tener URLs reales que configurar).
