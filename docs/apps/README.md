# Sanddy Almacén

Catálogo, lista de interés y panel de administración de inventario para una tienda pequeña. El frontend vive en [`Front/`](../../apps/Front) y el backend en [`Back/`](../../apps/Back); los datos se guardan en PostgreSQL.

🌐 **En producción: <https://sanddy-almacen.onrender.com/>** — el catálogo en la raíz, el panel en `/admin` y el estado del servicio en `/api/health`.

📖 [Cómo funciona la aplicación](./como-funciona.md) — explicación técnica en lenguaje sencillo.
🚀 [Guía paso a paso para correrla](./como-correr.md) — instrucciones detalladas, incluyendo solución de problemas comunes.
🌐 [Cómo publicarla gratis](./despliegue.md) — desplegar el monolito en Render con la base en Neon, paso a paso.

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
