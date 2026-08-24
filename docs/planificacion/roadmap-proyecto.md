# Roadmap del Proyecto — Sanddy Almacén

## Estado actual

El proyecto está **construido, funcional en local y con el código listo para desplegar en
Azure** (fases 1 a 5 de la migración implementadas; ver detalle en
[`despliegue-azure.md`](../apps/despliegue-azure.md)). Solo quedan pasos manuales de
aprovisionamiento en Azure (crear los recursos reales y cargar las variables de entorno de
producción) para que quede en línea.

- Entrevista al cliente y documento de contexto: completados (`docs/investigacion/`).
- Estructura del monorepo (`apps/Back`, `apps/Front`), TypeScript, ESLint, Prettier: completados.
- Backend, frontend y base de datos: **construidos y funcionando en local** (Docker + `npm run dev`).
- Migración a Azure: fases 0–6 completadas a nivel de código y documentación. Falta únicamente
  ejecutar los comandos de Azure CLI / Portal contra una suscripción real (ver
  [`como-desplegar.md`](../apps/como-desplegar.md)).

---

## Pila tecnológica real (vigente)

Esta es la arquitectura **efectivamente construida**, no la propuesta original. Ver
"Historial de decisiones abandonadas" más abajo para el contexto de por qué difiere del plan
inicial.

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Vite + React + TypeScript (SPA, sin SSR) | Ya estaba construido así; cubre el catálogo público y el panel `/admin` sin necesitar SSR/SEO. |
| Hosting frontend | Azure Static Web Apps | Sirve el build estático de Vite tal cual, con `staticwebapp.config.json` para el fallback de rutas del lado del cliente (`/admin` con refresh). |
| Backend | Fastify (Node 20), servidor de larga duración | Ya estaba construido así; corre en Azure App Service sin necesidad de reescribir rutas como funciones serverless. |
| Hosting backend | Azure App Service (Linux, plan B1) | Corre el servidor Fastify compilado (`node dist/server.js`) tal cual. |
| Base de datos | PostgreSQL + Prisma ORM | El schema ya es 100% relacional; Azure Database for PostgreSQL (flexible server) lo soporta sin tocar el `schema.prisma`. |
| Imágenes | Azure Blob Storage (con fallback a disco local vía `STORAGE_DRIVER`) | Almacenamiento persistente y compartido entre instancias; en local sigue guardando en disco sin cambios. |
| Autenticación admin | Cookie de sesión firmada (JWT), un solo usuario, credenciales en variables de entorno | Sandra es la única administradora; evita construir un sistema de login completo que no se necesita. |
| Carrito / lista de interés | Estado en `localStorage` del navegador; se resuelve contra el backend al confirmar pedido | El carrito en curso es transitorio y vive en el cliente; los pedidos confirmados sí se persisten en Postgres. |
| Validaciones | Zod (donde aplica) | Reutilizable entre formularios de admin y rutas de backend. |
| CI/CD | GitHub Actions (`deploy-backend.yml`, `deploy-frontend.yml`) | Se disparan por push a `main` según qué carpeta (`apps/Back` o `apps/Front`) cambió. |

---

## Historial de decisiones abandonadas

Documentado explícitamente para que futuras personas que lean planes anteriores no asuman
que siguen vigentes.

### 1. AWS + DynamoDB + S3 + React puro (plan más antiguo)

Existió una primera propuesta (ver `plan-desarrollo-fases-2-11.md`, marcado como histórico)
basada en AWS: DynamoDB para datos, S3 para imágenes, CloudFront, etc. **Fue abandonada antes
de escribir código de infraestructura.** El proyecto que efectivamente se construyó usa
PostgreSQL relacional (vía Prisma) desde el primer commit del backend, no DynamoDB. Ese
documento se conserva solo como referencia histórica del pensamiento inicial, no como plan
vigente.

### 2. Azure Functions + Cosmos DB + Next.js (segunda propuesta, la que congelaba este documento)

Esta versión anterior de este mismo `roadmap-proyecto.md` proponía:
- **Next.js** (App Router) por SEO/OpenGraph de productos compartidos.
- **Azure Functions** integradas a Static Web Apps como backend serverless.
- **Cosmos DB** (free tier) como base de datos NoSQL.

Ninguna de las tres se usó. Lo que se construyó y funciona hoy es **Fastify + PostgreSQL +
Vite** (SPA sin SSR). Motivos de por qué se abandonó cada pieza, documentados en detalle en
[`plan-migracion-azure.md`](./plan-migracion-azure.md) (Fase 0):

- **Next.js → se abandonó**: el flujo de negocio real de Sandra es compartir por WhatsApp
  directo, no búsqueda orgánica; el SEO/OpenGraph que justificaba Next.js no es una prioridad
  actual. Migrar la SPA de Vite ya construida a Next.js no daba ningún beneficio funcional
  nuevo y sí implicaba reescribir todo el frontend.
- **Azure Functions → se abandonó**: Fastify ya es un servidor de larga duración funcionando.
  Forzarlo a un modelo serverless habría significado reescribir cada ruta como una función
  independiente, sin ninguna ganancia real — Azure App Service corre servidores Node/Fastify
  normales sin ese refactor.
- **Cosmos DB → se abandonó**: el `schema.prisma` del backend ya es 100% relacional
  (`Categoria`, `Producto`, `Pedido`/`LineaPedido`, `Usuario`, con relaciones entre tablas).
  Migrarlo a un motor NoSQL como Cosmos DB habría implicado rediseñar todo el modelo de
  datos sin necesidad — Azure Database for PostgreSQL ofrece Postgres administrado,
  compatible con el schema tal cual está.

**Regla aplicada en la migración real:** ninguna decisión de infraestructura debía forzar una
reescritura de una capa que ya funcionaba. Azure tiene servicios (App Service, Azure Database
for PostgreSQL, Static Web Apps, Blob Storage) que soportan el stack ya construido sin
refactor, así que se usaron esos en vez de adaptar el código al plan original.

---

## Cómo se llegó del plan a la implementación

1. Se detectó la incompatibilidad entre el plan (Cosmos DB / Functions / Next.js) y el código
   real (Fastify / PostgreSQL / Vite) — motivo original de este documento.
2. Se congeló la decisión de **no reescribir** lo que ya funcionaba (Fase 0 de
   [`plan-migracion-azure.md`](./plan-migracion-azure.md)).
3. Se migró cada capa a su equivalente en Azure, controlado por variables de entorno y sin
   ramas de código tipo `if (isAzure)`:
   - Fase 1 — imágenes a Blob Storage (con fallback a disco local).
   - Fase 2 — base de datos a Azure Database for PostgreSQL.
   - Fase 3 — backend a Azure App Service.
   - Fase 4 — frontend a Azure Static Web Apps.
   - Fase 5 — endurecimiento de seguridad antes de producción.
   - Fase 6 — esta actualización de documentación.
4. El detalle técnico de qué cambió en el código en cada fase, y los comandos de Azure CLI
   pendientes de correr contra una suscripción real, están en
   [`despliegue-azure.md`](../apps/despliegue-azure.md).
5. La guía práctica, lineal, para ejecutar el despliegue real de punta a punta está en
   [`como-desplegar.md`](../apps/como-desplegar.md).

---

## Próximo paso

No hay más trabajo de código pendiente para desplegar. El próximo paso es **operativo**:
ejecutar los comandos de Azure CLI listados en
[`como-desplegar.md`](../apps/como-desplegar.md) contra una suscripción real de Azure, cargar
las variables de entorno de producción, y conectar los pipelines de GitHub Actions.

Trabajo de producto pendiente (no relacionado con el despliegue) queda fuera del alcance de
este roadmap de infraestructura; ver el backlog funcional en
`plan-desarrollo-fases-2-11.md` únicamente como referencia histórica de ideas, no como fuente
de verdad del estado actual.
