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

- `src/app.ts`: arma la instancia de Fastify — registra CORS, cookies, JWT, multipart, el manejador de errores y las rutas.
- `src/routes/`: un archivo por recurso (`auth`, `categorias`, `productos`, `pedidos`, `imagenes`, `health`). Las rutas de lectura del catálogo (`GET /productos`, `GET /categorias`, `GET /imagenes/:id`) y el checkout (`POST /pedidos`) son públicas; el resto requiere sesión de admin.
- `src/plugins/`: configuración de `@fastify/cors`, `@fastify/cookie`, `@fastify/jwt`, `@fastify/multipart`.
- `src/utils/`: helpers (hash de contraseñas, generación de código de pedido, slugs, errores HTTP).
- `prisma/schema.prisma`: modelos `Categoria`, `Producto`, `Imagen` (bytes de las fotos subidas), `Pedido`/`LineaPedido` y `Usuario` (login de admin).
- `prisma/seed.ts`: siembra las categorías/productos de ejemplo y crea el usuario admin inicial (idempotente — no pisa la contraseña si el usuario ya existe).
- `docker-compose.yml`: solo levanta Postgres (`db`). El backend corre local con `npm run dev`; se dockerizará en una vuelta futura (hay un TODO en el propio `docker-compose.yml`).

## Imágenes

Las fotos de producto viven en la tabla `imagenes` (columna `datos BYTEA`), no en el disco. `POST /imagenes` (requiere sesión) recibe un multipart de máximo 5 MB, valida el tipo contra una lista de formatos rasterizados —SVG queda fuera porque es XML y puede llevar un `<script>` que se ejecutaría desde el mismo origen que la API— y devuelve `{ url: "/imagenes/<id>" }`. `GET /imagenes/:id` es pública y sirve los bytes con `Cache-Control: immutable`, porque el id es único por subida y la fila nunca se reescribe.

`Producto.imagenes` sigue siendo una lista de URLs **mixtas**: rutas propias (`/imagenes/<id>`, relativas a propósito para no dejar el host del entorno escrito en la base) y URLs externas, como las de Unsplash que usa el seed. El frontend las resuelve con `resolveImagenUrl()` de `Front/src/services/store.ts`; nunca hay que poner `producto.imagenes[0]` directo en un `<img src>`. El navegador comprime a JPEG de 800 px antes de subir (`Front/src/admin/image.ts`), así que cada fila pesa unos 100 KB.

`Imagen` **no tiene relación con `Producto`** a propósito: la subida ocurre antes de que el producto exista en la base (el panel sube la foto y solo después hace `PUT`/`POST /productos`), y la fuente de verdad de qué imágenes tiene un producto es su array de URLs. El precio es que nadie borra las huérfanas — ni al quitar una foto, ni al borrar el producto, ni si el admin cierra el formulario sin guardar. Cuando estorbe, la limpieza es un comando:

```sql
-- Borra las imágenes que ningún producto referencia y que llevan más de un día en la
-- base (el margen evita borrar una recién subida que aún está en un formulario abierto).
DELETE FROM imagenes i
WHERE i."createdAt" < now() - interval '1 day'
  AND NOT EXISTS (
    SELECT 1 FROM productos p WHERE p.imagenes && ARRAY['/imagenes/' || i.id]
  );
```

## Autenticación

Un solo tipo de usuario (admin de la tienda), guardado en la tabla `Usuario` (username + hash bcrypt). El login (`POST /auth/login`) firma un JWT y lo manda en una cookie `httpOnly`/`SameSite=Lax` válida por 8 horas; `GET /auth/me` la valida al cargar el panel para no pedir login de nuevo en cada refresh, y `POST /auth/logout` la limpia. No hay rate limiting en el login todavía — limitación conocida, no bloqueante para un solo admin de confianza.

## Extender

- Nueva entidad: agregar el modelo en `schema.prisma`, migrar (`prisma migrate dev`), y un archivo en `Back/src/routes/`.
- Nueva pantalla de admin: seguir el patrón de `Front/src/admin/Categories.tsx` u `Orders.tsx` (modal + `services/store.ts` para los datos).
