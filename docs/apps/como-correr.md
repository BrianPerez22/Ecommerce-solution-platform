# Cómo correr Sanddy Almacén paso a paso

Necesitas tres cosas corriendo al mismo tiempo: la base de datos (Docker), el backend y el frontend. Van en terminales separadas.

## Requisitos

- **Node.js** 20 o superior (`node -v` para comprobar).
- **Docker Desktop** instalado y **abierto** (el ícono debe estar corriendo, no solo instalado).

## Paso 1 — Levantar la base de datos

Esta sección asume que **nunca has corrido este proyecto antes**: no tienes la imagen de PostgreSQL descargada ni el contenedor creado. Docker se encarga de las dos cosas con un solo comando, no hay que hacer nada por separado.

### 1.1 — Confirma que Docker está instalado y abierto

```bash
docker --version
```

Si el comando no existe, necesitas instalar **Docker Desktop** (búscalo en el sitio oficial de Docker para tu sistema operativo, es gratis para uso individual). Una vez instalado, ábrelo como cualquier aplicación y espera a que el ícono indique que está corriendo (puede tardar uno o dos minutos la primera vez).

### 1.2 — Levanta el servicio de base de datos

Abre una terminal en la carpeta del proyecto:

```bash
cd Back
docker compose up -d db
```

`Back/docker-compose.yml` describe qué imagen usar (`postgres:16-alpine`) y cómo debe llamarse el contenedor (`sanddy-db`). Como es la primera vez, Docker no tiene esa imagen guardada localmente, así que **la descarga de internet antes de arrancar nada**. Vas a ver algo parecido a esto en la terminal:

```
Image postgres:16-alpine Pulling
 7f5de3d007ea Pulling fs layer
 ...
 f0e7204f9584 Downloading 45.2MB
 ...
Image postgres:16-alpine Pulled
Volume back_sanddy_db_data Creating
Volume back_sanddy_db_data Created
Container sanddy-db Creating
Container sanddy-db Created
Container sanddy-db Starting
Container sanddy-db Started
```

Esa descarga pesa unos 100-150 MB, así que puede tardar desde unos segundos hasta un par de minutos según tu conexión. **Solo pasa la primera vez** — las próximas veces que corras este comando, Docker ya tiene la imagen guardada y arranca el contenedor casi al instante, sin descargar nada.

También crea automáticamente un **volumen** (`back_sanddy_db_data`), que es donde Postgres guarda los datos en el disco de tu computador — así, aunque apagues el contenedor, los datos no se pierden.

### 1.3 — Confirma que quedó corriendo

```bash
docker ps
```

Deberías ver una fila con `sanddy-db` en la columna `NAMES` y `Up` en `STATUS`:

```
CONTAINER ID   IMAGE                COMMAND                  STATUS         NAMES
a1b2c3d4e5f6   postgres:16-alpine   "docker-entrypoint.s…"   Up 5 seconds   sanddy-db
```

Si no aparece nada, revisa el mensaje de error de `docker compose up` — lo más común es que Docker Desktop no estaba abierto (ver 1.1).

> A partir de aquí, la base de datos ya existe como contenedor. Las próximas veces que quieras trabajar en el proyecto, este mismo comando (`docker compose up -d db`) simplemente lo vuelve a arrancar si estaba apagado — no vuelve a crear nada desde cero.

## Paso 2 — Configurar y arrancar el backend

En la misma terminal (o una nueva, pero siempre dentro de `Back/`):

```bash
cd Back
```

**Solo la primera vez**, crea tu archivo de variables de entorno copiando la plantilla:

```bash
cp .env.example .env
```

(En Windows con PowerShell: `Copy-Item .env.example .env`)

Instala las dependencias y prepara la base de datos:

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
```

- `prisma:migrate` crea las tablas en Postgres según `prisma/schema.prisma`.
- `prisma:seed` llena esas tablas con 3 categorías, 12 productos de ejemplo, y crea el usuario admin (`sanddy` / `sanddy2026` por defecto — se puede cambiar en `.env` antes de sembrar, con `ADMIN_INITIAL_USERNAME`/`ADMIN_INITIAL_PASSWORD`).

Ahora sí, arranca el servidor:

```bash
npm run dev
```

Deja esta terminal abierta. Deberías ver `Server listening at http://localhost:3001`.

## Paso 3 — Configurar y arrancar el frontend

Abre **otra terminal** (deja la del backend corriendo):

```bash
cd Front
```

**Solo la primera vez**:

```bash
cp .env.example .env
npm install
```

Arranca el frontend:

```bash
npm run dev
```

Vite te va a mostrar una dirección, normalmente `http://localhost:5173`. Ábrela en el navegador.

## Paso 4 — Usar la aplicación

- **Catálogo público**: `http://localhost:5173` — no necesita login.
- **Panel de administración**: `http://localhost:5173/admin` — usuario `sanddy`, contraseña `sanddy2026` (o las que hayas puesto en `Back/.env` antes de sembrar).

## Apagar todo

- Backend y frontend: `Ctrl+C` en cada terminal.
- Base de datos: `docker compose down` (dentro de `Back/`). Esto detiene el contenedor pero **no borra los datos** (quedan en un volumen de Docker). Si además quieres borrar los datos guardados: `docker compose down -v`.

## Comandos útiles (dentro de `Back/`)

| Comando | Para qué sirve |
|---|---|
| `npm run prisma:studio` | Abre una interfaz visual en el navegador para ver/editar las tablas directamente. |
| `npm run prisma:seed` | Vuelve a correr la siembra de datos de ejemplo. Es seguro correrlo de nuevo: no duplica categorías/productos, y no toca la contraseña del admin si ya existe. |
| `npm run build` | Compila el backend a JavaScript plano (`dist/`), para verificar que no hay errores de tipos antes de un despliegue. |

## Problemas comunes

**"listen EADDRINUSE: address already in use"** (el puerto 3001 o 5173 ya está ocupado)
Significa que ya hay otro proceso usando ese puerto — probablemente una instancia anterior del mismo backend/frontend que no se cerró bien. Busca y cierra ese proceso, o cierra la terminal donde quedó corriendo.

**El backend no conecta a la base de datos**
Confirma que Docker Desktop esté abierto y que `docker ps` muestre `sanddy-db` como `Up`. Si no existe, repite el Paso 1.

**"Falta la variable de entorno JWT_SECRET" (u otra) al arrancar el backend**
Falta el archivo `Back/.env`. Cópialo desde `Back/.env.example` (Paso 2).

**El panel de admin no carga productos / da error de red**
Confirma que el backend esté corriendo (`http://localhost:3001/health` debe responder `{"status":"ok"}`) y que `Front/.env` tenga `VITE_API_URL=http://localhost:3001`.
