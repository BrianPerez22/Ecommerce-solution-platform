# Cómo funciona Sanddy Almacén

Explicación técnica pero en lenguaje sencillo de qué hace cada parte de la aplicación y cómo se conectan entre sí.

## La idea general

Sanddy Almacén es una tienda con tres piezas:

```
Navegador (cliente o admin)
        │  HTTP (fetch)
        ▼
  Front/  (React + Vite)
        │  HTTP (fetch, con cookie de sesión)
        ▼
  Back/  (Fastify, API)
        │  SQL (Prisma)
        ▼
  Postgres (Docker)  — datos y bytes de las imágenes
```

- **`Front/`** es lo que ve el usuario en el navegador: el catálogo, el carrito y el panel de administración. No guarda datos "de verdad" — le pregunta todo al backend.
- **`Back/`** es la API: recibe peticiones HTTP, valida, habla con la base de datos y responde JSON. No sabe nada de React ni de HTML.
- **Postgres** guarda los datos permanentes: productos, categorías, pedidos, el usuario admin y también **los bytes de las imágenes** que se suben desde el panel — no queda ningún archivo en el disco.

Ninguna de las dos partes puede funcionar sola de forma útil: el frontend sin el backend no tiene productos que mostrar, y el backend sin frontend es solo una API que se probaría con `curl`.

## El frontend (`Front/`)

Construido con **React + TypeScript + Vite**. Todo el código vive en `Front/src/`.

### Cómo está organizado

| Carpeta | Qué contiene |
|---|---|
| `catalog/` | Lo que ve un cliente: la grilla de productos (`Catalog.tsx`), el detalle de un producto (`ProductDialog.tsx`) y el carrito/checkout (`Cart.tsx`). |
| `admin/` | El panel privado: la tabla de inventario (`Admin.tsx`, `SheetRow.tsx`), el formulario de producto (`ProductForm.tsx`), categorías, historial de pedidos (`Orders.tsx`) e import/export de CSV. |
| `components/` | Cosas compartidas entre catálogo y admin: el header, el botón de WhatsApp, los estilos CSS. |
| `services/store.ts` | **La única puerta de salida hacia el backend.** Ningún otro archivo llama a `fetch` directamente — todos pasan por aquí. |
| `models/` | Los "tipos" de datos: qué campos tiene un `Producto`, una `Categoria`, un `Pedido`. |
| `hooks/useInventory.ts` | Carga productos, categorías y carrito una sola vez al abrir la página. |

### El punto clave: `services/store.ts`

Este archivo es la frontera entre el frontend y el backend. Expone funciones como `getProductos()`, `saveProducto()`, `crearPedido()`, `login()`. Por dentro, cada una hace un `fetch` a `http://localhost:3001/...` (la URL viene de `VITE_API_URL` en `Front/.env`).

Una particularidad: el **carrito de compras en curso** (lo que el cliente va agregando antes de confirmar) NO pasa por el backend — vive en `localStorage` del navegador. Solo cuando el cliente confirma el pedido, ese carrito se convierte en una petición real (`POST /pedidos`) y ahí sí queda guardado en la base de datos para siempre.

## El backend (`Back/`)

Construido con **Fastify** (un framework de servidor HTTP para Node.js, parecido a Express pero más rápido) + **Prisma** (para hablar con la base de datos sin escribir SQL a mano) + **PostgreSQL**.

### Cómo está organizado

| Carpeta | Qué contiene |
|---|---|
| `src/app.ts` | Arma el servidor: qué plugins usa (CORS, cookies, JWT, subida de archivos) y qué rutas existen. |
| `src/routes/` | Un archivo por "tema": `productos.ts`, `categorias.ts`, `pedidos.ts`, `imagenes.ts`, `auth.ts`. Cada uno define sus endpoints (`GET`, `POST`, etc.). |
| `src/plugins/` | Configuración de piezas reutilizables: CORS, cookies, JWT. |
| `prisma/schema.prisma` | La definición de las tablas de la base de datos (cómo es un `Producto`, una `Categoria`, etc.). |
| `prisma/seed.ts` | Un script que llena la base de datos con datos de ejemplo (12 productos, 3 categorías, 1 usuario admin) la primera vez. |

### Qué endpoints existen

| Ruta | Qué hace | ¿Necesita login? |
|---|---|---|
| `GET /productos`, `GET /categorias` | El catálogo que ve cualquier visitante. | No |
| `POST /pedidos` | El cliente confirma su compra desde el carrito. | No |
| `POST/PUT/DELETE /productos`, `/categorias` | Crear, editar o borrar desde el panel. | Sí |
| `GET /pedidos` | El historial de pedidos que ve el admin. | Sí |
| `POST /imagenes` | Subir una imagen de producto (se guarda en la base de datos). | Sí |
| `GET /imagenes/:id` | Devolver los bytes de una imagen para mostrarla. | No |
| `POST /auth/login`, `/auth/logout`, `GET /auth/me` | Iniciar sesión, cerrar sesión, saber quién está logueado. | — |

La idea: **el catálogo es público** (cualquiera puede mirarlo y comprar), pero **editar el inventario requiere ser Sanddy**.

## Cómo se guardan los datos

Todo vive en 6 tablas de Postgres (definidas en `prisma/schema.prisma`):

- **`Categoria`**: nombre, slug, orden en el que aparece.
- **`Producto`**: nombre, precio, stock, descripción, imágenes (una lista de URLs), a qué categoría pertenece.
- **`Imagen`**: los bytes de una foto subida desde el panel, con su tipo (JPEG, PNG...) y su tamaño. Es lo que devuelve `GET /imagenes/:id`.
- **`Pedido`**: el código del pedido (ej. `SA-4AAI`), nombre del cliente (opcional), total.
- **`LineaPedido`**: cada producto dentro de un pedido, con la cantidad y el precio que tenía *en ese momento* (así el historial no cambia si después subes el precio del producto).
- **`Usuario`**: el o los admins que pueden entrar al panel (usuario + contraseña encriptada).

## Cómo funciona el login (autenticación)

1. El admin escribe usuario y contraseña en `/admin`.
2. El frontend manda eso a `POST /auth/login`.
3. El backend busca el usuario en la tabla `Usuario`, compara la contraseña (encriptada con `bcrypt`, nunca se guarda en texto plano) y, si es correcta, genera un **JWT** (un token firmado que dice "este es sanddy, válido hasta tal hora").
4. Ese token se guarda en una **cookie `httpOnly`** — el navegador la maneja solo, JavaScript no puede leerla (más seguro contra ciertos ataques).
5. En cada petición siguiente, el navegador manda esa cookie automáticamente. El backend la valida antes de dejar pasar a las rutas protegidas.
6. La sesión dura 8 horas. Pasado ese tiempo, o si el admin hace clic en "Cerrar sesión", hay que loguearse de nuevo.

## Un flujo completo, de punta a punta

**Ejemplo: Sanddy sube un producto nuevo con foto**

1. En el panel, Sanddy llena el formulario y elige una imagen de su computador.
2. El navegador comprime la imagen (la hace más chica) *antes* de subirla, para no gastar espacio de más.
3. El frontend la sube con `POST /imagenes` → el backend guarda los bytes en la tabla `Imagen` de Postgres y devuelve una ruta como `/imagenes/abc123`.
4. El frontend guarda esa ruta dentro del producto y lo envía con `POST /productos` (o `PUT` si ya existía).
5. El backend valida los datos (que la categoría exista, que el precio sea un número, etc.) y lo guarda en Postgres.
6. La próxima vez que cualquier visitante abre el catálogo, `GET /productos` trae ese producto nuevo con la ruta de su foto, y cada `<img>` le pide los bytes al backend con `GET /imagenes/abc123`.

**Ejemplo: un cliente hace un pedido**

1. El cliente navega el catálogo (público, sin login) y agrega productos a su lista — esto solo vive en su navegador (`localStorage`).
2. Al confirmar, el frontend manda `POST /pedidos` con la lista de productos y cantidades.
3. El backend revisa que los productos existan, calcula el total, genera un código único (`SA-XXXX`) y guarda el pedido en Postgres — **esto sí es público, un cliente no necesita loguearse para comprar.**
4. El frontend recibe el código y arma un mensaje para enviar por WhatsApp, con un QR.
5. Sanddy, ya logueada en su panel, puede ver ese pedido en "Historial de pedidos" (`GET /pedidos`, esta sí requiere login).
