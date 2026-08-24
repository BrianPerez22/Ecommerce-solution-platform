# Update Azure — Checklist de lo realizado

Registro de todo lo que se ejecutó para dejar Sanddy Almacén reestructurado, funcional en
local y listo para desplegar en Azure. Cada ítem incluye **qué** se cambió y **por qué**.
Referencia rápida; el detalle técnico línea por línea vive en
[`docs/apps/despliegue-azure.md`](./docs/apps/despliegue-azure.md) y el plan original en
[`docs/planificacion/plan-migracion-azure.md`](./docs/planificacion/plan-migracion-azure.md).

---

## Fase 0 — Principio de diseño

**Por qué esta fase existe:** el plan original suponía Azure Functions + Cosmos DB +
Next.js, pero lo que realmente estaba construido era Fastify + PostgreSQL + Vite. Había que
decidir, antes de tocar código, si se reescribía el proyecto para calzar con el plan o se
adaptaba el plan al proyecto real.

- [x] Se decidió mantener el stack real (Fastify + PostgreSQL + Vite) en vez de reescribirlo
      al plan original. **Por qué:** reescribir esas tres capas no daba ningún beneficio
      funcional nuevo — Azure tiene servicios (App Service, Azure Database for PostgreSQL,
      Static Web Apps) que soportan el stack ya construido sin refactor.
- [x] Se estableció la regla: cada integración nueva se controla por variables de entorno,
      con default que sigue usando lo local — sin ramas `if (isAzure)` en el código. **Por
      qué:** para que el proyecto siguiera funcionando 100% en local durante y después de
      cada cambio, sin que nada se rompiera "solo por pensar en Azure".

## Fase 1 — Imágenes: disco local → Azure Blob Storage

**Por qué esta fase existe:** en la nube el disco del servidor no es persistente ni
compartido entre instancias; si el backend se reinicia o escala, las imágenes subidas se
pierden. Es necesaria sin importar qué se decida en las otras fases.

- [x] `apps/Back/src/services/storage.ts` (nuevo) — abstracción única que decide entre disco
      local y Blob Storage según `STORAGE_DRIVER`. **Por qué:** para que ninguna otra parte
      de la app tenga que preguntar cuál driver está activo; el resto del código no cambia
      sin importar dónde termine viviendo el archivo.
- [x] `apps/Back/src/routes/uploads.ts` — delega en `storage.ts` en vez de escribir a disco
      directamente. **Por qué:** para que la ruta `/uploads` no tenga que saber si el destino
      es local o Azure — solo le pide el archivo a `storage.ts`.
- [x] `apps/Back/src/env.ts` — variables `storageDriver`, `azureStorageConnectionString`,
      `azureStorageContainer`, con `local` como default. **Por qué:** así ningún desarrollador
      necesita tocar nada para que `npm run dev` siga funcionando igual que siempre; Azure
      solo se activa si alguien pone `STORAGE_DRIVER=azure` explícitamente.
- [x] `apps/Back/package.json` — agregado `@azure/storage-blob`. **Por qué:** es el SDK
      oficial que `storage.ts` necesita para hablar con Blob Storage.
- [x] `apps/Front/src/services/store.ts` — corregido `uploadImagen` para no anteponer
      `VITE_API_URL` cuando el backend ya devuelve una URL absoluta. **Por qué:** antes
      siempre pegaba `VITE_API_URL` al inicio de la URL que devolvía el backend; eso
      funcionaba con rutas locales relativas, pero rompía en cuanto el backend empezara a
      devolver URLs absolutas de Azure (`https://cuenta.blob.core.windows.net/...`).
- [x] `apps/Back/docker-compose.yml` — servicio opcional `azurite`. **Por qué:** para poder
      probar `STORAGE_DRIVER=azure` en la máquina local, sin necesitar una cuenta real de
      Azure ni gastar dinero solo para probar que el flujo funciona.
- [x] Verificado que `ProductCard.tsx`, `ProductForm.tsx`, `admin/image.ts` no necesitaron
      cambios. **Por qué era importante confirmarlo:** esos componentes ya consumían la URL
      tal cual venía del backend, sin asumir su forma — si hubieran asumido que siempre era
      una ruta relativa, se habrían roto al cambiar a Azure.

## Fase 2 — Base de datos: Postgres local (Docker) → Azure Database for PostgreSQL

**Por qué esta fase existe:** el `schema.prisma` ya es 100% relacional; migrarlo a Cosmos DB
(NoSQL, el plan original) habría implicado rehacer todo el modelo de datos sin ninguna
necesidad real. Azure ofrece PostgreSQL administrado, compatible con el schema tal cual está.

- [x] `apps/Back/package.json` — nuevo script `prisma:migrate:deploy`. **Por qué:** `migrate
      dev` (el que se usa en local) genera migraciones nuevas y pide confirmación
      interactiva — correrlo contra la base de datos real sería peligroso. `migrate deploy`
      solo aplica migraciones ya generadas, sin preguntar nada, que es lo correcto en
      producción.
- [x] `.gitignore` — ahora ignora también `.env.production` y `.env.*.local`. **Por qué:**
      antes solo ignoraba `.env` a secas; si alguien creaba `.env.production` con la
      contraseña real de Azure, git la habría subido al repo sin avisar.
- [x] `apps/Back/prisma/seed.ts` — respeta `SEED_SAMPLE_DATA`. **Por qué:** el seed normal
      carga categorías/productos de ejemplo con fotos de Unsplash; en la base de datos real
      de Azure no se quiere ese catálogo de prueba mezclado con productos reales, así que con
      `SEED_SAMPLE_DATA=false` el seed crea solo el usuario admin.
- [x] `apps/Back/.env.production.example` (nuevo) — plantilla de referencia sin secretos
      reales. **Por qué:** para que quede documentado, en un solo lugar, qué variables
      necesita producción, sin tener que adivinarlas ni copiarlas mal desde `.env.example`
      (que trae valores de desarrollo).
- [x] `schema.prisma` — sin cambios. **Por qué es relevante mencionarlo:** confirma que no
      hubo "migración entre motores" de datos — solo cambió el destino de la conexión, el
      modelo de datos siguió intacto.

## Fase 3 — Backend: Fastify → Azure App Service

**Por qué esta fase existe:** Fastify es un servidor de larga duración; forzarlo a Azure
Functions (serverless, el plan original) habría implicado reescribir cada ruta como función
independiente. Azure App Service corre el servidor Node/Fastify tal cual, sin ese refactor.

- [x] `apps/Back/src/server.ts` — agregado `host: '0.0.0.0'`. **Por qué:** Fastify por
      defecto solo escucha en `127.0.0.1`, que es invisible desde fuera del contenedor de
      App Service. Sin este cambio el backend desplegado respondería "Application Error"
      aunque el resto del código estuviera perfecto — es fácil de pasar por alto porque en
      local no se nota ninguna diferencia.
- [x] `apps/Back/src/env.ts` / `plugins/cors.ts` — `CORS_ORIGIN` acepta varios orígenes
      separados por coma. **Por qué:** en producción normalmente hay dos dominios válidos —
      el propio y el `*.azurestaticapps.net` que Azure asigna por defecto al Static Web App —
      y CORS necesita permitir ambos a la vez.
- [x] `apps/Back/package.json` — `engines.node: "20.x"`; `build` ahora corre
      `prisma generate && tsc`. **Por qué:** `engines` le dice a App Service qué runtime de
      Node usar; hacer explícito `prisma generate` en el build evita depender de que los
      postinstall scripts estén habilitados en el pipeline de CI (en la máquina local esto ya
      pasaba solo, al hacer `npm install`).
- [x] `.github/workflows/deploy-backend.yml` (nuevo) — pipeline de build + deploy a App
      Service. **Por qué:** para que cada push a `main` que toque `apps/Back/` despliegue
      automáticamente, sin tener que subir el código a mano cada vez.

## Fase 4 — Frontend: Vite → Azure Static Web Apps

**Por qué esta fase existe:** Vite ya genera una SPA compilada y estática; Static Web Apps
la sirve tal cual, sin necesitar Next.js (el plan original) ni un servidor Node corriendo
para el frontend.

- [x] `apps/Front/staticwebapp.config.json` (nuevo). **Por qué:** el frontend maneja la
      navegación entre catálogo y `/admin` a mano con `history.pushState`, sin librería de
      routing. Eso funciona perfecto navegando desde adentro, pero si alguien entra directo a
      `/admin` o le da refresh ahí, un hosting estático normal buscaría un archivo literal en
      `/admin` y respondería 404. Este archivo le dice a Static Web Apps que sirva
      `index.html` para cualquier ruta que no sea un archivo estático real.
- [x] `.github/workflows/deploy-frontend.yml` (nuevo). **Por qué:** igual que con el backend,
      para desplegar automáticamente en cada push a `main` que toque `apps/Front/`. Además
      pasa `VITE_API_URL` como variable del paso de build — Vite "hornea" las variables
      `VITE_*` dentro del bundle al compilar, no las lee en tiempo de ejecución como sí hace
      el backend, así que no se puede configurar después del build como cualquier otra
      variable de Azure.

## Fase 5 — Seguridad antes de salir a producción

**Por qué esta fase existe:** varias configuraciones que eran razonables para desarrollo
local (contraseñas de prueba, cookies sin `secure`, secretos débiles) son inaceptables una
vez que la aplicación queda expuesta en internet.

- [x] `apps/Back/package.json` — `overrides` para `deepmerge-ts`. **Por qué:** `npm audit`
      reportaba 3 vulnerabilidades "high" que venían de una dependencia transitiva de la CLI
      de Prisma, no de código propio ni de `@prisma/client` (el que corre en producción). El
      override fuerza esa dependencia puntual a una versión parcheada sin tener que
      actualizar Prisma entero. Resultado: `npm audit` reporta 0 vulnerabilidades.
- [x] `apps/Back/src/routes/auth.ts` / `env.ts` — cookie de sesión depende de
      `COOKIE_SECURE`. **Por qué:** como el frontend (Static Web Apps) y el backend (App
      Service) viven en dominios *distintos* en producción, el navegador exige
      `SameSite=None` para mandar la cookie entre esos dos dominios, y a su vez exige que sea
      `Secure` en cuanto es `None`. Sin este cambio, el login del panel admin "funciona"
      (responde 200) pero la sesión no persiste — cada request siguiente llega sin cookie.
- [x] `apps/Back/src/routes/uploads.ts` — lista blanca de tipos de imagen explícita
      (`image/jpeg`, `image/png`, `image/webp`), ya no acepta `image/svg+xml`. **Por qué:**
      un SVG es XML y puede llevar `<script>` embebido; si alguna vez se abre el blob
      directamente en el navegador (en vez de solo como `<img src>`), es un vector de XSS. No
      rompe nada del flujo actual porque el frontend siempre exporta las imágenes a JPEG de
      todas formas.
- [x] `.env.example` / `.env.production.example` — documentan `COOKIE_SECURE`. **Por qué:**
      para que quede visible desde el primer momento que esta variable existe y qué valor
      necesita cada entorno, en vez de ser un detalle escondido en el código.
- [x] Confirmado (sin cambio de código, ya cubierto por fases anteriores): `JWT_SECRET`
      fuerte se genera con `openssl rand -hex 32`; `ADMIN_INITIAL_USERNAME` /
      `ADMIN_INITIAL_PASSWORD` se cambian antes de sembrar en Azure; el límite de subida de
      imágenes (5 MB / 1 archivo) ya existía. **Por qué se dejan documentados igual:** para
      que el checklist de seguridad quede completo en un solo lugar, aunque no hayan
      requerido tocar código.

## Fase 6 — Documentación

**Por qué esta fase existe:** los documentos de planificación describían una arquitectura
(Cosmos DB / Azure Functions / Next.js, e incluso antes, AWS/DynamoDB) que nunca se construyó
— la misma confusión que motivó todo este plan de migración. Dejar eso sin corregir habría
hecho que la próxima persona que abriera el repo cayera en el mismo malentendido.

- [x] `docs/planificacion/roadmap-proyecto.md` — reescrito. **Por qué:** para que refleje el
      stack real (Fastify + PostgreSQL + Vite + Azure) en vez del plan abandonado, y para
      dejar un historial explícito de por qué se abandonaron AWS/DynamoDB y luego Cosmos
      DB/Azure Functions/Next.js — así nadie vuelve a proponer reescribir hacia esas
      tecnologías sin saber que ya se evaluaron y descartaron.
- [x] `docs/planificacion/plan-migracion-azure.md` (nuevo). **Por qué:** `despliegue-azure.md`
      ya referenciaba este archivo como su documento "padre", pero nunca existía en el repo —
      era un link roto. Se agregó para que la referencia resuelva a algo real.
- [x] `docs/planificacion/plan-desarrollo-fases-2-11.md` — marcado como histórico. **Por
      qué:** es el plan más antiguo, basado en AWS/DynamoDB, previo incluso a la propuesta de
      Cosmos DB. Sin una nota clara, alguien podría leerlo y pensar que describe la
      arquitectura vigente.
- [x] `docs/apps/como-desplegar.md` (nuevo). **Por qué:** `despliegue-azure.md` explica qué
      cambió en el código y por qué, fase por fase, pero no es una guía lineal para ejecutar
      el despliegue de punta a punta. Hacía falta un documento equivalente a
      `como-correr.md`, pero para producción, con los comandos en el orden correcto y un
      checklist final.
- [x] `docs/apps/despliegue-azure.md` — completada la sección "Fase 6" que estaba vacía. **Por
      qué:** por consistencia — las otras 5 fases ya estaban documentadas ahí; dejar la
      sección de esta fase vacía habría sido la misma clase de documentación incompleta que
      motivó este trabajo.
- [x] `docs/apps/README.md` — enlaces agregados. **Por qué:** para que la guía de despliegue y
      el roadmap actualizado sean fáciles de encontrar desde la puerta de entrada de
      `docs/apps/`, en vez de quedar enterrados y sin referenciar.
- [x] `README.md` (raíz) — estructura de carpetas corregida. **Por qué:** describía
      `apps/web` + AWS, una estructura que ya no existe; es el primer archivo que alguien
      lee al abrir el repo, así que era el lugar donde más daño hacía estar desactualizado.

---

## Estado final

- [x] Proyecto funcional en local (Docker + `npm run dev`), verificado por el usuario.
- [x] Código listo para desplegar en Azure (fases 1-5 implementadas).
- [x] Documentación consistente con la arquitectura real (fase 6 implementada).
- [ ] **Pendiente (fuera del alcance del código):** ejecutar los comandos de Azure CLI en
      [`docs/apps/como-desplegar.md`](./docs/apps/como-desplegar.md) contra una suscripción
      real de Azure para dejar la app en línea.