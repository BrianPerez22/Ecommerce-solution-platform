# Sanddy Almacén

Catálogo, lista de interés y panel de administración de inventario para una tienda pequeña. El frontend vive en [`Front/`](../../apps/Front) y el backend en [`Back/`](../../apps/Back); los datos se guardan en PostgreSQL.

📖 [Cómo funciona la aplicación](./como-funciona.md) — explicación técnica en lenguaje sencillo.
🚀 [Guía paso a paso para correrla en local](./como-correr.md) — instrucciones detalladas, incluyendo solución de problemas comunes.
☁️ [Guía paso a paso para desplegarla en Azure](./como-desplegar.md) — recursos reales de Azure, variables de producción y checklist final.
🧭 [Bitácora técnica de la migración a Azure](./despliegue-azure.md) — qué cambió en el código, fase por fase, y por qué.
🗺️ [Roadmap y arquitectura vigente](../planificacion/roadmap-proyecto.md) — estado del proyecto y decisiones de stack (incluye por qué se abandonó Cosmos DB/Azure Functions/Next.js).

## Cómo correr (resumen rápido)

1. **Base de datos** (Docker):
   ```bash
   cd Back
   docker compose up -d db
   ```
2. **Backend**:
   ```bash
   cd Back
   cp .env.example .env   # si no existe ya
   npm install
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```
   Queda escuchando en `http://localhost:3001`.
3. **Frontend** (en otra terminal):
   ```bash
   cd Front
   cp .env.example .env   # si no existe ya
   npm install
   npm run dev
   ```
   Abre la dirección que muestra Vite. El panel está en `/admin`.

## Acceso al panel

El login de `/admin` es real: valida usuario y contraseña contra la tabla `Usuario` de Postgres y mantiene la sesión en una cookie por 8 horas. El usuario inicial se crea al correr `npm run prisma:seed` en `Back/`, con las credenciales definidas en `Back/.env` (`ADMIN_INITIAL_USERNAME`/`ADMIN_INITIAL_PASSWORD`, por defecto `sanddy` / `sanddy2026`). Cambiar la contraseña de ese usuario hoy requiere editarla directamente en la base de datos (no hay UI de "cambiar contraseña" todavía).

## Datos y ajustes

- La semilla de categorías, productos y el usuario admin está en `Back/prisma/seed.ts`.
- Cambia el número de WhatsApp en la constante `WHATSAPP_NUMBER` de `Front/src/components/WhatsAppButton.tsx`. Debe ir con indicativo de país y sin `+`.
- El frontend solo habla con el backend a través de `Front/src/services/store.ts`.
- El carrito en curso (antes de confirmar un pedido) vive en `localStorage` del navegador; los pedidos confirmados, productos, categorías y usuarios viven en Postgres.
- La importación CSV reconoce las columnas exportadas por el propio panel: `id, nombre, categoria, precio, stock, activo, descripcion, caracteristicas, imagen`.

Ver [`architecture.md`](./architecture.md) para el detalle de la arquitectura.
