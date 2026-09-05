# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

**Sanddy Almacén** — catálogo público + panel de administración de inventario para una tienda pequeña (proyecto universitario, EAN). No hay pasarela de pago: el cliente arma una "lista de interés", confirma, y eso genera un pedido con código (`SA-XXXX`), un QR y un enlace de WhatsApp para cerrar la venta por fuera de la app.

El repo es un monorepo sin workspaces: `apps/Front/` y `apps/Back/` son dos proyectos npm independientes, cada uno con su propio `package.json`. **No hay `package.json` en la raíz** — todo comando npm se corre dentro de `apps/Front` o `apps/Back`.

El idioma del proyecto es español: nombres de modelos/campos (`Producto`, `precio`, `caracteristicas`), comentarios, mensajes de error de la API y textos de UI. Mantenerlo así al escribir código nuevo.

## Comandos

Base de datos: **`apps/Back/docker-compose.yml` está borrado en el árbol de trabajo** (todavía existe en `HEAD`: `git show HEAD:apps/Back/docker-compose.yml`), así que `docker compose up -d db` hoy no funciona tal cual. Postgres tiene que estar corriendo por otro medio y coincidir con el `DATABASE_URL` del `.env` (por defecto `sanddy:sanddy@localhost:5432/sanddy_almacen`). `docs/apps/como-correr.md` sigue describiendo el flujo con Compose. Si se restaura el archivo, los comandos son (desde `apps/Back/`, con Docker Desktop abierto):

```bash
docker compose up -d db     # Postgres 16-alpine, contenedor sanddy-db, puerto 5432
docker compose down         # detiene; -v además borra el volumen de datos
```

Backend (`apps/Back/`, escucha en `http://localhost:3001`):

```bash
npm run dev            # tsx watch src/server.ts
npm run build          # tsc -> dist/ (es el único "typecheck" del backend)
npm run prisma:migrate # prisma migrate dev
npm run prisma:seed    # siembra categorías, productos y el usuario admin (idempotente)
npm run prisma:studio  # GUI de la base de datos
```

Frontend (`apps/Front/`, Vite en `http://localhost:5173`):

```bash
npm run dev
npm run build    # tsc -b && vite build — usarlo para verificar tipos
npm run format   # prettier --write .
```

Imagen monolito (desde la raíz del repo, es la que se despliega):

```bash
docker build -t sanddy-monolito .
docker run --rm -p 3001:3001 -e DATABASE_URL=... -e JWT_SECRET=... sanddy-monolito
```

Primera vez en cada app: `cp .env.example .env` antes de `npm install`.

**No hay tests ni ESLint configurados** en ninguna de las dos apps (`apps/Front/tests/` y `docs/apps/front-tests.md` son placeholders). El `README.md` de la raíz lista scripts `lint`/`typecheck`/`format` que no existen — es documentación heredada del scaffold original, ignorarla. La verificación disponible hoy es `npm run build` en cada app.

## Arquitectura

```
Navegador → Front (React+Vite) → Back (Fastify) → Postgres (Prisma)
                                                        └→ imágenes: tabla `imagenes` (BYTEA)
```

### Front (`apps/Front/`)

- **`src/services/store.ts` es la única frontera con el backend.** Ningún otro archivo llama `fetch`. Todo va con `credentials: 'include'` (la sesión es cookie httpOnly) y `VITE_API_URL`. Cualquier endpoint nuevo se expone como función aquí.
- **La API se llama siempre por `/api`, nunca por `http://localhost:3001`.** `VITE_API_URL=/api` (en `.env` y en `.env.example`), y así el navegador habla siempre con su propio origen: en desarrollo el proxy de `vite.config.ts` reenvía `/api` al backend **sin reescribir el prefijo** (el backend ya monta ahí toda la API), y en producción el backend sirve este front. No volver a poner un host absoluto: la cookie de sesión es `SameSite=Lax` y dejaría de enviarse.
- **No hay router.** `App.tsx` decide la página con `location.pathname === '/admin'` al montar y navega con `history.pushState`. Agregar una pantalla = agregar un valor al tipo `Page` en `components/Header.tsx`, no instalar react-router sin discutirlo.
- **El carrito en curso vive en `localStorage`**, deliberadamente: es estado transitorio del navegador. Solo al confirmar se convierte en `POST /pedidos` y queda en Postgres.
- Las imágenes se comprimen en el navegador (`admin/image.ts`, canvas → JPEG 800px) *antes* de subirlas; el backend no reprocesa nada, solo guarda los bytes en Postgres.
- `Producto.imagenes` es una lista **mixta**: rutas propias `/imagenes/<id>` (relativas a propósito, para no dejar el host del entorno escrito en la base) y URLs externas (las de Unsplash del seed). Pintarlas **siempre** con `resolveImagenUrl()` de `services/store.ts`, nunca `<img src={producto.imagenes[0]}>` directo.
- Estilos: Tailwind v4 vía `@tailwindcss/vite`, más `components/styles.css` para lo que no es utilitario. No hay `tailwind.config`.
- `WHATSAPP_NUMBER` en `components/WhatsAppButton.tsx` está en `'NUMERO_PLACEHOLDER'` — es la constante real que usan el botón flotante y el checkout del carrito. Va con indicativo de país y sin `+`.

### Back (`apps/Back/`)

- ESM con `module: NodeNext`: **los imports internos llevan extensión `.js`** (`from './prisma.js'`) aunque el archivo sea `.ts`.
- `src/app.ts` arma la instancia (plugins → error handler → rutas) y `src/server.ts` solo la escucha, para poder construir la app sin levantar el puerto.
- **Toda la API cuelga de `/api`** (`API_PREFIX` en `app.ts`), porque la raíz la ocupa el front: `plugins/static.ts` sirve `Front/dist` desde este mismo servidor y su `setNotFoundHandler` devuelve el `index.html` para las rutas del SPA (`/admin`, `/carrito`). Ese handler responde 404 en JSON — no el `index.html` — cuando la ruta empieza por `/api`, cuando no es GET, o cuando parece un archivo (`/assets/algo.js`): un asset faltante servido como HTML se rompe de forma ilegible en el navegador. Si `Front/dist` no existe (desarrollo), `registerStatic` no registra nada y el servidor arranca solo con la API.
- Un archivo por recurso en `src/routes/`. **Público:** `GET /productos`, `GET /categorias`, `GET /imagenes/:id`, `POST /pedidos` (checkout del visitante), `GET /health`, `/auth/*`. **Todo lo demás requiere `{ onRequest: [app.requireAuth] }`** — ese decorador se define en `plugins/jwt.ts` y se declara en `src/types/fastify.d.ts`.
- Errores: lanzar `HttpError(status, mensaje)` (o `notFound('Producto')`) desde `utils/httpError.ts`; el handler global de `app.ts` los convierte en `{ message }`. Los errores de Prisma se traducen a mano (`P2025` → 404).
- Sin validación por esquema: cada ruta valida a mano sobre un `type ...Body` local. No hay Zod pese a lo que diga el roadmap.
- `env.ts` falla al arrancar si faltan `DATABASE_URL` o `JWT_SECRET`; el resto tiene default. `NODE_ENV=production` activa tres cosas a la vez: `secure: true` en la cookie de sesión, `trustProxy` en Fastify y el servido del front. `server.ts` escucha en `0.0.0.0` a propósito — dentro de un contenedor, el localhost por defecto deja el servicio inalcanzable.
- Al manejar bytes en `routes/imagenes.ts`: Prisma tipa `Bytes` como `Uint8Array<ArrayBuffer>` (no `Buffer`), así que el `Buffer` de `file.toBuffer()` no compila — envolverlo en `new Uint8Array(...)`. Fastify 5 sí serializa un `Uint8Array` sin convertirlo, pero el `Content-Type` va **antes** del `send()` o sale `application/octet-stream`, y el 404 hay que lanzarlo antes de tocar cabeceras. El 413 de `@fastify/multipart` llega en inglés y se traduce a mano. Límites: 1 archivo de 5 MB (`plugins/multipart.ts`) y solo JPEG/PNG/WebP/AVIF/GIF — **SVG queda fuera a propósito** (es XML, puede llevar un `<script>` y esta ruta lo serviría desde el mismo origen que la API). El GET responde con `Cache-Control` inmutable a un año porque la fila nunca se reescribe.

### Datos y reglas de negocio

- **Los precios son enteros de pesos colombianos, sin decimales ni centavos** (`precio Int`). Formateo en `Front/src/utils/format.ts`.
- `LineaPedido` guarda `productoNombre` y `precioUnitario` copiados al momento del pedido: el historial no debe cambiar si el producto se edita o se borra después (`productoId` es `SetNull` a propósito).
- `Imagen` no tiene FK a `Producto` a propósito: la subida ocurre antes de que el producto exista. Nadie borra las huérfanas — hay un TODO en `routes/imagenes.ts` y la consulta de limpieza en `docs/apps/architecture.md`.
- **`POST /pedidos` no descuenta stock.** Es una lista de interés, no una venta cerrada; el stock lo ajusta el admin desde el panel.
- `saveProducto`/`saveCategoria` en `store.ts` hacen PUT y, si falla, POST (upsert desde el cliente) — por eso `POST /productos` acepta un `id` opcional.
- Un solo tipo de usuario (admin). JWT firmado en cookie `sanddy_session`, `httpOnly`/`SameSite=Lax`, 8 horas. Sin rate limiting en el login y `secure: false` — limitaciones conocidas, hay TODO en `routes/auth.ts`.
- Credenciales iniciales desde `ADMIN_INITIAL_USERNAME`/`ADMIN_INITIAL_PASSWORD` del `.env` del backend (por defecto `sanddy`/`sanddy2026`). No hay UI de cambio de contraseña; se cambia en la base de datos.
- El import CSV del panel espera las mismas columnas que exporta: `id, nombre, categoria, precio, stock, activo, descripcion, caracteristicas, imagen`.

## Despliegue

Va como **monolito**: un solo servicio sirve la API bajo `/api` y el build del front en la raíz. No es solo comodidad — con el front en otro dominio, la cookie `SameSite=Lax` se vuelve cookie de terceros y el panel de admin no puede iniciar sesión.

- El `Dockerfile` de la raíz construye las dos apps y arma una imagen con la misma disposición `Back/` + `Front/` que el repo, para que el `FRONTEND_DIST` por defecto (`../Front/dist`) siga valiendo.
- `prisma` está en **dependencies**, no en devDependencies: el contenedor corre `prisma migrate deploy` al arrancar y necesita el CLI después de un `npm ci --omit=dev`.
- El `seed` usa `tsx` (devDependency) y por eso **no corre dentro de la imagen**. La siembra inicial se hace desde una máquina con el repo, apuntando `DATABASE_URL` a la base de producción.
- Destino previsto: servicio web en Render (plan gratis: duerme a los 15 min, despierta en ~1 min) + Postgres en Neon (el Postgres gratis de Render se borra a los 30 días). Render inyecta `PORT`; `env.ts` ya lo lee.
- Antes de publicar hay que rellenar `WHATSAPP_NUMBER` en `Front/src/components/WhatsAppButton.tsx`, que sigue en `'NUMERO_PLACEHOLDER'`.

## Documentación

`docs/apps/` (`architecture.md`, `como-funciona.md`, `como-correr.md`, `despliegue.md`) describe el sistema tal como está implementado y conviene actualizarla junto con el código. Ojo: usa rutas `Back/` y `Front/` sin el prefijo `apps/`.

`docs/planificacion/roadmap-proyecto.md` está **desactualizado** respecto al código: propone Next.js + Azure + Cosmos DB + Zustand + Zod, mientras lo construido es Vite + React + Fastify + Prisma + Postgres local. Tratarlo como historia de decisiones, no como especificación. `docs/investigacion/` es material de entrevistas y UX.
