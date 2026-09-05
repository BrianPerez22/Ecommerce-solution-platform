# Cómo publicar Sanddy Almacén gratis (Render + Neon)

La app se publica como **monolito**: un solo servicio sirve la API bajo `/api` y, en la misma dirección, el catálogo y el panel. La base de datos vive aparte, en Neon.

No es solo por ahorrar un servicio. La sesión del admin viaja en una cookie `SameSite=Lax`: si el front viviera en un dominio y el backend en otro, el navegador la trataría como cookie de terceros, no la enviaría, y **no se podría entrar al panel**. Un solo origen elimina el problema de raíz.

| Pieza | Dónde | Plan gratis |
|---|---|---|
| App (API + front) | Render, servicio web con Docker | Duerme a los 15 min sin visitas; despertar tarda ~1 min |
| Base de datos | Neon (PostgreSQL) | 0,5 GB de almacenamiento, no caduca |

> **Por qué la base no va también en Render:** su PostgreSQL gratis **se borra 30 días después de crearlo**. El de Neon no vence por tiempo.

---

## Antes de empezar

1. **Rellena el número de WhatsApp.** En `Front/src/components/WhatsAppButton.tsx`, la constante `WHATSAPP_NUMBER` dice `'NUMERO_PLACEHOLDER'`. Va con indicativo de país y sin `+` (para Colombia: `57` seguido del número). Sin esto, el botón flotante y el cierre del carrito llevan a una dirección rota.

2. **Sube el código a GitHub.** Render despliega desde el repositorio, no desde tu disco:

   ```bash
   git add .
   git commit -m "feat: despliegue monolito (Docker + API bajo /api)"
   git push origin documentacion
   ```

3. **Ten a mano una terminal en el proyecto.** El Paso 2 se corre desde tu PC.

---

## Paso 1 — Crear la base de datos en Neon

1. Entra a **neon.tech** y crea la cuenta con **Sign up with GitHub**. No pide tarjeta.

2. Te pedirá crear un proyecto:
   - **Project name**: `sanddy-almacen`
   - **Postgres version**: deja la que viene por defecto
   - **Region**: cualquiera de las de EE. UU. sirve — por ejemplo **AWS US East 2 (Ohio)**. Lo que importa es **anotar cuál elegiste**: en el Paso 4 tienes que escoger esa misma región en Render, para que la app y la base no queden lejos hablándose.
   - **Services**: deja encendido solo **Postgres database**. *Object storage*, *Functions*, *AI gateway* y *Neon Auth* no los usa la app (Neon Auth, de hecho, es un sistema de login que competiría con el tuyo).

3. Al crearlo te muestra la **connection string**. Antes de copiarla, busca la casilla que dice **"Connection pooling"** y **déjala apagada**.

   > Neon ofrece dos direcciones para la misma base: la *pooled* y la directa. El contenedor aplica las migraciones al arrancar, y eso necesita la conexión directa. Con la *pooled*, el arranque puede fallar con un error difícil de interpretar.

4. Copia la cadena completa. Se ve así:

   ```
   postgresql://neondb_owner:UNA_CLAVE_LARGA@ep-algo-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

   Guárdala en un bloc de notas: la vas a usar dos veces (Paso 2 y Paso 4). El `?sslmode=require` del final **no se quita**.

---

## Paso 2 — Crear las tablas y sembrar los datos, desde tu PC

Render, en su plan gratis, **no da acceso a una terminal dentro del servidor**. Así que la siembra inicial (categorías, productos de ejemplo y el usuario admin) se hace desde tu máquina, apuntando a Neon.

1. Abre `Back/.env` y **cambia temporalmente** la línea `DATABASE_URL` por la cadena de Neon. Deja las demás líneas como están.

2. Desde `Back/`, corre:

   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```

   - `migrate deploy` crea las tablas aplicando las migraciones que ya están en `prisma/migrations/`.
   - `prisma:seed` llena 3 categorías, 12 productos de ejemplo y crea el usuario admin con el `ADMIN_INITIAL_USERNAME` / `ADMIN_INITIAL_PASSWORD` de ese mismo `.env`.

   > ⚠️ **Nunca corras `npm run prisma:migrate` apuntando a Neon.** Ese script es `prisma migrate dev`, que ante cualquier diferencia ofrece **resetear la base** — es decir, borrar todo lo publicado. Contra una base en producción, siempre `migrate deploy`.

3. **Pon una contraseña de admin decente** antes de seguir, si la app va a quedar pública. Cambia `ADMIN_INITIAL_PASSWORD` en el `.env`, borra el usuario que acabas de crear desde el editor SQL de Neon (`DELETE FROM usuarios;`) y vuelve a correr `npm run prisma:seed`. Hay que borrarlo primero porque el seed no le toca la contraseña a un usuario que ya existe.

4. **Devuelve `Back/.env` a la base local** (`postgresql://sanddy:sanddy@localhost:5432/...`). Si lo dejas apuntando a Neon, cualquier `prisma migrate dev` que corras mientras desarrollas se lleva por delante los datos publicados.

---

## Paso 3 — Generar la clave de sesión

El `JWT_SECRET` firma las cookies de sesión. El del `.env.example` dice literalmente "cambiar-en-produccion". Genera uno de verdad:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado al bloc de notas.

---

## Paso 4 — Crear el servicio en Render

1. Entra a **render.com** y crea la cuenta con **GitHub**.

2. Botón **New +** → **Web Service**.

3. **Connect a repository**: autoriza a Render el acceso a tu GitHub y elige `Ecommerce-solution-platform`.

4. Rellena la configuración:

   | Campo | Valor |
   |---|---|
   | **Name** | `sanddy-almacen` (define la URL: `sanddy-almacen.onrender.com`) |
   | **Region** | **La misma que elegiste en Neon** (Ohio, si seguiste el ejemplo) |
   | **Branch** | `documentacion` (o `main`, si ya fusionaste) |
   | **Root Directory** | Déjalo **vacío** — el `Dockerfile` está en la raíz del repo |
   | **Language** / Runtime | **Docker** (Render suele detectarlo solo al ver el Dockerfile) |
   | **Dockerfile Path** | `./Dockerfile` |
   | **Instance Type** | **Free** |

5. En **Environment Variables**, agrega dos:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | La cadena de Neon del Paso 1 |
   | `JWT_SECRET` | La clave del Paso 3 |

   No hace falta nada más: `PORT` lo inyecta Render, `NODE_ENV=production` ya viene en el Dockerfile, y `CORS_ORIGIN` no se usa en producción porque el front y la API comparten origen.

6. Abre **Advanced** y pon **Health Check Path**: `/api/health`. Así Render sabe si la app está viva de verdad (esa ruta consulta la base) y no solo si el proceso arrancó.

7. **Create Web Service**.

El primer despliegue tarda entre 5 y 10 minutos: tiene que construir el front, construir el backend y armar la imagen. Verás el log en vivo. Cuando aparezca algo como `Server listening at http://0.0.0.0:10000`, ya está publicada.

---

## Paso 5 — Comprobar que quedó bien

Abre, en este orden:

1. `https://sanddy-almacen.onrender.com/api/health` → debe responder `{"status":"ok"}`. Si dice `error`, el problema es la base de datos, no la app.
2. `https://sanddy-almacen.onrender.com/` → el catálogo, con los 12 productos del seed.
3. `https://sanddy-almacen.onrender.com/admin` → inicia sesión con tu usuario y contraseña de admin.
4. Ya dentro del panel, **sube una imagen a un producto**. Es la prueba que cierra el círculo: la foto se comprime en el navegador, viaja a la API, se guarda en Neon y vuelve a pintarse desde ahí.

---

## El día a día

- **La primera visita después de un rato es lenta.** Tras 15 minutos sin tráfico, Render apaga el servicio; la siguiente petición lo despierta y tarda cerca de un minuto. No está roto. Si vas a mostrar el proyecto, ábrelo dos minutos antes.
- **Cada `git push` a la rama conectada dispara un despliegue nuevo**, automáticamente.
- **Las migraciones se aplican solas.** El contenedor corre `prisma migrate deploy` antes de arrancar el servidor: si creaste una migración nueva en local, basta con hacer push.
- **Vigila el espacio de Neon.** Las fotos de los productos viven dentro de la base (tabla `imagenes`), no en disco. Con 0,5 GB y fotos de ~100 KB caben unas 4.000–5.000 — de sobra para el catálogo, pero es el número que se llena primero.
- **Para mirar o editar la base publicada**, usa el editor SQL de Neon, o `npx prisma studio` desde `Back/` con el `.env` apuntando temporalmente a Neon.

---

## Problemas comunes

**El build falla enseguida con "Dockerfile not found"**
El campo *Root Directory* quedó con algo escrito. Debe estar vacío: el `Dockerfile` está en la raíz del repositorio y necesita ver las dos carpetas de `apps/`.

**El log dice "Falta la variable de entorno JWT_SECRET" (o `DATABASE_URL`)**
Faltó agregarla en *Environment* del Paso 4. Agrégala y usa **Manual Deploy → Deploy latest commit**.

**`/api/health` responde 503 "No hay conexión con la base de datos"**
La `DATABASE_URL` está mal copiada. Revisa que sea la cadena **completa**, que termine en `?sslmode=require` y que sea la directa (sin `-pooler` en el nombre del host).

**El log muestra `P1001: Can't reach database server`**
Mismo origen que el anterior: cadena equivocada, o le falta el `sslmode=require`.

**El login dice "Usuario o contraseña incorrectos" aunque la clave es la correcta**
La base está vacía: falta el Paso 2. El usuario admin no se crea solo al desplegar.

**El catálogo carga pero sale sin productos**
Igual que el anterior: se aplicaron las migraciones, pero no se corrió el seed.

**`/admin` da 404 o la página sale en blanco**
El build del front no llegó a la imagen. Revisa en el log de Render que la etapa `front-build` haya terminado con `✓ built in ...`.

**"Se cayó solo" después de un rato**
No se cayó: es el apagado por inactividad del plan gratis. Vuelve a entrar y espera el minuto de arranque.
