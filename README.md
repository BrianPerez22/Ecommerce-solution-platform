# Sanddy Almacen

Plataforma de catalogo e inventario para Sanddy Almacen. Permite al administrador gestionar productos y categorias mediante un panel tipo hoja de calculo, y permite a los clientes explorar el inventario publico y armar un carrito de interes que se convierte en un codigo QR, sin pasarela de pago.

## Estructura del proyecto

Monorepo simple con dos aplicaciones independientes, cada una con su propio `package.json`:

```
Ecommerce-solution-platform/
├── apps/
│   ├── Back/             # Fastify + Prisma + PostgreSQL (API, puerto 3001)
│   │   ├── src/
│   │   ├── prisma/
│   │   └── uploads/       # imágenes locales (STORAGE_DRIVER=local)
│   └── Front/            # Vite + React + TypeScript (SPA, puerto 5173)
│       └── src/
├── docs/
│   ├── apps/              # cómo funciona, cómo correr, cómo desplegar a Azure
│   ├── investigacion/     # entrevistas, contexto, UX
│   └── planificacion/     # roadmap y decisiones de arquitectura
├── .github/workflows/     # CI/CD a Azure (backend y frontend)
└── README.md
```

> Nota: si ves referencias a `sanddy-almacen`, `apps/web` o AWS/DynamoDB en documentos de
> `docs/planificacion/`, son propuestas anteriores que **no** corresponden a esta estructura.
> Ver [`docs/planificacion/roadmap-proyecto.md`](./docs/planificacion/roadmap-proyecto.md)
> para el historial de por qué se abandonaron.

## Requisitos previos

- Node.js 20 o superior
- Docker Desktop (para PostgreSQL en local)

## Cómo correr el proyecto

Ver la guía completa en [`docs/apps/como-correr.md`](./docs/apps/como-correr.md). Resumen:

```bash
# 1. Base de datos
cd apps/Back && docker compose up -d db

# 2. Backend
cp .env.example .env && npm install && npm run prisma:migrate && npm run prisma:seed
npm run dev   # http://localhost:3001

# 3. Frontend (otra terminal)
cd apps/Front && cp .env.example .env && npm install
npm run dev   # http://localhost:5173, panel en /admin
```

## Cómo desplegar a producción (Azure)

Ver [`docs/apps/como-desplegar.md`](./docs/apps/como-desplegar.md) para la guía paso a paso, o
[`docs/apps/despliegue-azure.md`](./docs/apps/despliegue-azure.md) para el detalle técnico de
qué cambió en el código para soportar Azure.

## Documentacion

La documentacion funcional y tecnica del proyecto se encuentra en la carpeta [`docs/`](./docs), organizada en `docs/apps` (guías técnicas de Front/Back y despliegue), `docs/investigacion` (entrevistas, contexto, UX) y `docs/planificacion` (roadmap y decisiones de arquitectura).
