# Arquitectura

Dos proyectos independientes en la raíz del repo, cada uno con su propio `package.json`.

## `Front/` — Vite + React + TypeScript

- `index.html`, `src/main.tsx`: punto de entrada de la aplicación.
- `src/admin`: panel de administración (inventario, categorías, historial de pedidos, login).
- `src/catalog`: catálogo público, lista de interés y checkout.
- `src/components`: estilos y componentes visuales compartidos (header, botón de WhatsApp).
- `src/services/store.ts`: único punto de acceso a datos. Productos, categorías y pedidos van por HTTP al backend (`VITE_API_URL`, ver `.env`); el carrito en curso sigue en `localStorage` porque es estado transitorio del navegador, no algo que el backend necesite persistir.
- `src/models`: tipos compartidos con el shape que devuelve la API.
- `src/hooks`, `src/utils`: código reutilizable transversal.

## `Back/` — Fastify + Prisma + PostgreSQL

- `src/app.ts`: arma la instancia de Fastify — registra CORS, cookies, JWT, multipart, estáticos, el manejador de errores y las rutas.
- `src/routes/`: un archivo por recurso (`auth`, `categorias`, `productos`, `pedidos`, `uploads`, `health`). Las rutas de lectura del catálogo (`GET /productos`, `GET /categorias`) y el checkout (`POST /pedidos`) son públicas; el resto requiere sesión de admin.
- `src/plugins/`: configuración de `@fastify/cors`, `@fastify/cookie`, `@fastify/jwt`, `@fastify/multipart`, `@fastify/static`.
- `src/utils/`: helpers (hash de contraseñas, generación de código de pedido, slugs, errores HTTP).
- `prisma/schema.prisma`: modelos `Categoria`, `Producto`, `Pedido`/`LineaPedido` y `Usuario` (login de admin).
- `prisma/seed.ts`: siembra las categorías/productos de ejemplo y crea el usuario admin inicial (idempotente — no pisa la contraseña si el usuario ya existe).
- `uploads/`: archivos de imágenes subidos desde el panel, servidos en `/uploads/*`.
- `docker-compose.yml`: solo levanta Postgres (`db`). El backend corre local con `npm run dev`; se dockerizará en una vuelta futura (hay un TODO en el propio `docker-compose.yml`).

## Autenticación

Un solo tipo de usuario (admin de la tienda), guardado en la tabla `Usuario` (username + hash bcrypt). El login (`POST /auth/login`) firma un JWT y lo manda en una cookie `httpOnly`/`SameSite=Lax` válida por 8 horas; `GET /auth/me` la valida al cargar el panel para no pedir login de nuevo en cada refresh, y `POST /auth/logout` la limpia. No hay rate limiting en el login todavía — limitación conocida, no bloqueante para un solo admin de confianza.

## Extender

- Nueva entidad: agregar el modelo en `schema.prisma`, migrar (`prisma migrate dev`), y un archivo en `Back/src/routes/`.
- Nueva pantalla de admin: seguir el patrón de `Front/src/admin/Categories.tsx` u `Orders.tsx` (modal + `services/store.ts` para los datos).
