# Despliegue a Azure — bitácora de avance

Este documento acompaña a `plan-migracion-azure.md` y registra, fase por fase, qué se
implementó en el código y qué pasos manuales (Azure Portal / CLI) le quedan a quien despliegue.

---

## Fase 1 — Imágenes: disco local → Azure Blob Storage ✅ (código listo)

### Qué cambió en el código

- **`apps/Back/src/services/storage.ts`** (nuevo): abstracción única para guardar archivos.
  Decide entre disco local y Azure Blob Storage según `STORAGE_DRIVER`. Ninguna otra parte
  de la app pregunta cuál driver está activo.
- **`apps/Back/src/routes/uploads.ts`**: ahora delega en `storage.ts` en vez de escribir a
  disco directamente. La ruta `/uploads` no cambió (mismo método, misma respuesta `{ url }`).
- **`apps/Back/src/env.ts`**: agrega `storageDriver`, `azureStorageConnectionString`,
  `azureStorageContainer`. Si `STORAGE_DRIVER` no está definido, por defecto es `local` — el
  flujo de siempre (`npm run dev`) sigue funcionando exactamente igual, sin tocar nada.
- **`apps/Back/.env.example`**: documenta las nuevas variables.
- **`apps/Back/package.json`**: agrega `@azure/storage-blob`.
- **`apps/Front/src/services/store.ts`**: se corrigió `uploadImagen`. Antes siempre
  anteponía `VITE_API_URL` a la URL que devolvía el backend; eso rompía en cuanto el backend
  empezara a devolver URLs absolutas de Azure (`https://cuenta.blob.core.windows.net/...`).
  Ahora solo antepone `VITE_API_URL` si la URL recibida es relativa.
- **`apps/Back/docker-compose.yml`**: agrega un servicio opcional `azurite` (emulador local
  de Blob Storage) para poder probar `STORAGE_DRIVER=azure` sin una cuenta real de Azure.

`ProductCard.tsx`, `ProductForm.tsx` y `admin/image.ts` no necesitaron cambios: ya consumían
la URL devuelta por el backend tal cual, sin asumir su forma.

### Cómo probarlo en local (sin Azure)

No hay que hacer nada — `STORAGE_DRIVER` no está seteado en tu `.env`, así que por defecto
es `local` y todo sigue como hoy.

### Cómo probarlo en local simulando Azure (con Azurite)

```bash
cd apps/Back
docker compose --profile azure up -d azurite
```

En tu `.env` (temporalmente, para esta prueba):

```
STORAGE_DRIVER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
AZURE_STORAGE_CONTAINER=productos
```

(Esa es la cuenta/clave fija de desarrollo que trae Azurite por defecto, no es un secreto real.)

Reinicia `npm run dev` en Back y sube una imagen desde el panel `/admin`. Debería subir contra
el emulador y devolver una URL `http://127.0.0.1:10000/devstoreaccount1/productos/...`.

Vuelve a `STORAGE_DRIVER=local` (o borra la línea) cuando termines de probar.

### Pasos pendientes contra Azure real (requieren Azure CLI o Portal)

```bash
# 1. Grupo de recursos (si no existe uno ya para el proyecto)
az group create --name rg-sanddy-almacen --location eastus

# 2. Cuenta de Storage (el nombre debe ser único globalmente, todo en minúsculas)
az storage account create \
  --name sanddyalmacenstorage \
  --resource-group rg-sanddy-almacen \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# 3. Contenedor para las imágenes de producto, con acceso público de lectura por blob
az storage container create \
  --account-name sanddyalmacenstorage \
  --name productos \
  --public-access blob \
  --auth-mode login

# 4. Connection string para pegar en AZURE_STORAGE_CONNECTION_STRING (en App Service, Fase 3)
az storage account show-connection-string \
  --name sanddyalmacenstorage \
  --resource-group rg-sanddy-almacen
```

Con la connection string real, en producción basta con setear:

```
STORAGE_DRIVER=azure
AZURE_STORAGE_CONNECTION_STRING=<la que devolvió el comando 4>
AZURE_STORAGE_CONTAINER=productos
```

No hace falta tocar código ni volver a desplegar por esto — son solo variables de entorno
en Azure App Service (ver Fase 3).

---

## Fase 2 — Base de datos: Postgres local (Docker) → Azure Database for PostgreSQL ✅ (código listo)

`schema.prisma` no cambió — sigue siendo 100% Postgres, así que no hay migración de datos
"entre motores", solo un cambio de destino de conexión.

### Qué cambió en el código

- **`apps/Back/package.json`**: nuevo script `prisma:migrate:deploy` (usa `prisma migrate
  deploy`, que aplica migraciones ya generadas sin crear nuevas ni pedir confirmación
  interactiva — es el comando correcto para producción; `migrate dev`, que ya usas en local,
  **no** debe correrse contra la base de datos real).
- **`.gitignore`**: ahora también ignora `.env.production` y `.env.*.local`. Antes solo
  ignoraba `.env` a secas — si hubieras creado `.env.production` con la contraseña real de
  Azure, git la habría subido al repo.
- **`apps/Back/prisma/seed.ts`**: el seed ahora respeta `SEED_SAMPLE_DATA`. Por defecto sigue
  sembrando categorías/productos de ejemplo y un pedido demo (igual que hoy, para no romper
  tu flujo local). Si lo corres con `SEED_SAMPLE_DATA=false`, **solo** crea el usuario admin
  — pensado para cuando siembres la base de datos real de Azure y no quieras el catálogo de
  ejemplo con fotos de Unsplash mezclado con tus productos reales.
- **`apps/Back/.env.production.example`** (nuevo): plantilla de referencia con todas las
  variables que necesita producción (incluye las de esta fase y deja el lugar para las de
  fases siguientes). No tiene secretos reales, es solo la forma.

### Pasos pendientes contra Azure real (requieren Azure CLI o Portal)

```bash
# 1. Instancia de Postgres administrado (ajusta usuario/password/región/tamaño a tu caso)
az postgres flexible-server create \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-db \
  --location eastus \
  --admin-user sanddyadmin \
  --admin-password '<una contraseña fuerte, generada aparte>' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32

# 2. Crear la base de datos dentro del servidor (el servidor no trae "sanddy_almacen" por defecto)
az postgres flexible-server db create \
  --resource-group rg-sanddy-almacen \
  --server-name sanddy-almacen-db \
  --database-name sanddy_almacen

# 3. Firewall: permitir que servicios de Azure (tu futuro App Service) se conecten
az postgres flexible-server firewall-rule create \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3b. (Opcional, solo mientras pruebas desde tu propia máquina) permitir tu IP actual:
az postgres flexible-server firewall-rule create \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-db \
  --rule-name AllowMyIP \
  --start-ip-address <tu-ip-publica> \
  --end-ip-address <tu-ip-publica>
```

Con eso, tu `DATABASE_URL` de producción queda así (nota el `sslmode=require`, obligatorio
en Azure Database for PostgreSQL):

```
DATABASE_URL=postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require
```

### Aplicar las migraciones y sembrar datos contra Azure

Desde tu máquina (o desde el pipeline de CI/CD más adelante), **sin tocar tu `.env` local**:

```bash
cd apps/Back

# Aplica las mismas migraciones que ya corriste en local — no genera nada nuevo
DATABASE_URL="postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require" \
  npm run prisma:migrate:deploy

# Siembra SOLO el usuario admin (sin catálogo de ejemplo) — usa credenciales reales, no las de dev
DATABASE_URL="postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require" \
  SEED_SAMPLE_DATA=false \
  ADMIN_INITIAL_USERNAME="<usuario real>" \
  ADMIN_INITIAL_PASSWORD="<password real>" \
  npm run prisma:seed
```

Pasar `DATABASE_URL` así, inline en el comando, es intencional: así nunca se pisa el `.env`
local que usas a diario con `npm run dev` — ese sigue apuntando a Docker todo el tiempo.

⚠️ **Antes de correr el seed en Azure**, decide si de verdad quieres que quede solo el admin
(`SEED_SAMPLE_DATA=false`, catálogo vacío, lo cargas tú a mano desde `/admin`) o si prefieres
partir con el catálogo de ejemplo para no arrancar de cero (`SEED_SAMPLE_DATA=true`, y luego
editas/borras esos productos desde el panel). Es la decisión que menciona la Fase 2 del plan.

### Verificar la conexión

```bash
cd apps/Back
DATABASE_URL="<la url de arriba>" npx prisma studio
```

Si abre Prisma Studio y ves las tablas (con solo el usuario admin si usaste
`SEED_SAMPLE_DATA=false`), la conexión y las migraciones quedaron bien.

---

## Fase 3 — Backend: Fastify → Azure App Service ✅ (código listo)

Fastify sigue siendo un servidor de larga duración normal — App Service lo corre tal cual,
sin reescribir nada a Azure Functions.

### Qué cambió en el código

- **`apps/Back/src/server.ts`**: se agregó `host: '0.0.0.0'` al `app.listen(...)`. Esto es
  crítico y fácil de pasar por alto: Fastify por defecto solo escucha en `127.0.0.1`, que es
  invisible desde fuera del contenedor. Sin este cambio, el backend desplegado respondería
  "Application Error" en App Service aunque el resto del código esté perfecto. En tu Mac no
  cambia nada — `0.0.0.0` también acepta conexiones locales.
- **`apps/Back/src/env.ts` / `plugins/cors.ts`**: `CORS_ORIGIN` ahora acepta varios orígenes
  separados por coma. Útil porque en producción normalmente tendrás dos dominios válidos: el
  tuyo propio y el `*.azurestaticapps.net` que Azure asigna por defecto al Static Web App
  (Fase 4). En local sigue funcionando igual con un solo valor.
- **`apps/Back/package.json`**:
  - `engines.node: "20.x"` — le dice a App Service qué runtime de Node usar.
  - `build` ahora corre `prisma generate && tsc` (antes solo `tsc`). En tu máquina esto ya
    pasaba automáticamente al hacer `npm install`; en el pipeline de CI conviene que sea
    explícito para no depender de que los postinstall scripts estén habilitados ahí.
- **`.github/workflows/deploy-backend.yml`** (nuevo): pipeline de GitHub Actions que se
  dispara al hacer push a `main` con cambios en `apps/Back/`. Instala dependencias, compila,
  deja solo las dependencias de producción y despliega a App Service.

### Pasos pendientes contra Azure real (requieren Azure CLI o Portal)

```bash
# 1. Plan de App Service (Linux, el tier B1 alcanza para empezar; se puede subir después)
az appservice plan create \
  --resource-group rg-sanddy-almacen \
  --name plan-sanddy-almacen \
  --is-linux \
  --sku B1

# 2. El recurso App Service en sí, con runtime Node 20
az webapp create \
  --resource-group rg-sanddy-almacen \
  --plan plan-sanddy-almacen \
  --name sanddy-almacen-api \
  --runtime "NODE:20-lts"

# 3. Variables de entorno de producción (junta las de Fases 1, 2 y 5 — usa tus valores reales,
#    no los de .env.production.example)
az webapp config appsettings set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --settings \
    DATABASE_URL="postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require" \
    CORS_ORIGIN="https://<tu-dominio>,https://<nombre-swa-autogenerado>.azurestaticapps.net" \
    STORAGE_DRIVER="azure" \
    AZURE_STORAGE_CONNECTION_STRING="<connection string de Fase 1>" \
    AZURE_STORAGE_CONTAINER="productos" \
    JWT_SECRET="<generado con openssl rand -hex 32>" \
    ADMIN_INITIAL_USERNAME="<usuario real>" \
    ADMIN_INITIAL_PASSWORD="<password real>"

# 4. Comando de arranque explícito (App Service no sabe por sí solo que el server
#    compilado vive en dist/server.js dentro de apps/Back)
az webapp config set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --startup-file "node dist/server.js"

# 5. Configurar el health check (usa la ruta /health que el backend ya expone)
az webapp config set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --generic-configurations '{"healthCheckPath": "/health"}'
```

### Conectar el pipeline de GitHub Actions

1. En el portal de Azure: App Service `sanddy-almacen-api` → **Deployment Center** → **Manage
   publish profile** → descargar el archivo `.PublishSettings`.
2. En GitHub: `Settings` → `Secrets and variables` → `Actions` → **New repository secret**,
   nombre `AZURE_WEBAPP_PUBLISH_PROFILE`, pegar el contenido completo del archivo descargado.
3. Al hacer push a `main` tocando algo en `apps/Back/`, el workflow
   `.github/workflows/deploy-backend.yml` se dispara solo.

### Probar

```bash
curl https://sanddy-almacen-api.azurewebsites.net/health
# Debería responder {"status":"ok"}
```

Si responde `{"status":"error", ...}`, el problema típico es `DATABASE_URL` (revisa el
firewall de Fase 2). Si no responde nada (timeout/502), típicamente es el `host: '0.0.0.0'`
que ya está resuelto en el código, o el `startup-file` mal configurado.

---

## Fase 4 — Frontend: Vite → Azure Static Web Apps ✅ (código listo)

Vite ya genera una SPA compilada y estática; Static Web Apps la sirve tal cual, sin
necesidad de Next.js ni de un servidor Node corriendo para el frontend.

### Qué cambió en el código

- **`apps/Front/staticwebapp.config.json`** (nuevo): el frontend maneja la navegación entre
  catálogo y `/admin` a mano con `history.pushState` (sin librería de routing). Eso funciona
  perfecto mientras navegás dentro de la app, pero si alguien entra directo a
  `tudominio.com/admin` o le da refresh ahí, un hosting estático normal buscaría un archivo
  literal en `/admin` y respondería 404. Este archivo le dice a Static Web Apps que, para
  cualquier ruta que no sea un archivo estático real (imagen, CSS, JS), sirva `index.html` —
  así React toma el control y muestra la página correcta según la URL.
- **`.github/workflows/deploy-frontend.yml`** (nuevo): pipeline que compila y despliega en
  cada push a `main` que toque `apps/Front/`. Importante: le pasa `VITE_API_URL` como
  variable de entorno del paso de build — Vite "hornea" las variables `VITE_*` dentro del
  bundle en el momento de compilar, no las lee en runtime como sí hace el backend. Por eso
  esa URL no se configura como "appsetting" en ningún lado de Azure: se define como secret de
  GitHub y el pipeline la usa al construir.

### Pasos pendientes contra Azure real (requieren Azure CLI o Portal)

```bash
# Crear el recurso y conectarlo al repo de GitHub en un solo paso (te va a pedir
# autenticarte contra GitHub la primera vez). Azure genera su propio workflow YAML
# automáticamente al hacer esto — si lo hace, reemplázalo por
# .github/workflows/deploy-frontend.yml (el de este repo ya trae bien las rutas
# app_location/output_location y el manejo de VITE_API_URL).
az staticwebapp create \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-web \
  --source https://github.com/<tu-usuario>/<tu-repo> \
  --location eastus2 \
  --branch main \
  --app-location "apps/Front" \
  --output-location "dist" \
  --login-with-github
```

Ese comando ya deja conectado el repo y crea el secret `AZURE_STATIC_WEB_APPS_API_TOKEN` en
GitHub automáticamente. Solo falta agregar el otro secret a mano:

1. GitHub → `Settings` → `Secrets and variables` → `Actions` → **New repository secret**:
   - Nombre: `VITE_API_URL`
   - Valor: la URL real del backend de la Fase 3, ej. `https://sanddy-almacen-api.azurewebsites.net`

2. Actualiza `CORS_ORIGIN` en el App Service (Fase 3) con el dominio real que te haya
   asignado Static Web Apps (`https://<nombre-generado>.azurestaticapps.net`), o el dominio
   propio si ya conectaste uno:

```bash
az webapp config appsettings set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --settings CORS_ORIGIN="https://<nombre-generado>.azurestaticapps.net"
```

### Probar

Abre la URL que te dio `az staticwebapp create` (o el portal). Deberías ver el catálogo
público cargando productos reales desde el backend de Azure. Prueba también entrar
directamente a `/admin` (pegando la URL, no navegando desde adentro) para confirmar que el
`staticwebapp.config.json` está evitando el 404, e inicia sesión con el usuario admin real
que sembraste en la Fase 2.

Si el catálogo carga vacío o tira error de red en la consola del navegador, lo más probable
es un desajuste entre `VITE_API_URL` (lo que el frontend cree que es el backend) y
`CORS_ORIGIN` (a quién el backend le permite llamarlo) — revisa que ambos apunten a las URLs
reales y no queden con `localhost`.

---

## Fase 5 — Seguridad antes de salir a producción ✅ (código listo)

### Qué cambió en el código

- **`apps/Back/package.json`**: agregado `"overrides": { "deepmerge-ts": "^8.0.2" }`. Esto
  resuelve las 3 vulnerabilidades "high" que reportaba `npm audit` — venían de una
  dependencia transitiva de la CLI de Prisma (`@prisma/config` → `deepmerge-ts`), no de
  código propio ni de `@prisma/client` (el que sí corre en producción). El override fuerza
  esa dependencia puntual a una versión parcheada sin tocar la versión de Prisma en sí.
  Confirmado: `npm audit` ahora reporta **0 vulnerabilidades**, y la CLI de Prisma sigue
  funcionando igual con el override puesto.
- **`apps/Back/src/routes/auth.ts` / `env.ts`**: la cookie de sesión tenía `secure: false`
  fijo, con un `TODO` en el propio código pendiente desde antes. Ahora depende de la nueva
  variable `COOKIE_SECURE`:
  - `COOKIE_SECURE=false` (default, igual que hoy) → `secure: false, sameSite: 'lax'`. Sirve
    en local porque `localhost:5173` y `localhost:3001` son technically el mismo "site" para
    el navegador (mismo dominio raíz, solo cambia el puerto).
  - `COOKIE_SECURE=true` (obligatorio en producción) → `secure: true, sameSite: 'none'`.
    Esto no es opcional en tu caso: como el frontend (Static Web Apps) y el backend (App
    Service) van a vivir en dominios *distintos*, el navegador exige `SameSite=None` para
    mandar la cookie en esas llamadas cross-site, y a su vez exige que sea `Secure` en
    cuanto es `None`. Si te olvidas de poner `COOKIE_SECURE=true` en producción, el login
    del panel admin "funciona" (responde 200) pero la sesión no persiste — cada request
    siguiente llega sin cookie y parece que no quedaste logueado.
- **`apps/Back/src/routes/uploads.ts`**: antes aceptaba cualquier `image/*`, incluyendo
  `image/svg+xml`. Un SVG es XML y puede llevar `<script>` embebido — si alguna vez se abre
  el blob directamente en el navegador (en vez de solo como `<img src>`), es un vector de
  XSS. Ahora la lista blanca es explícita: solo `image/jpeg`, `image/png`, `image/webp`. No
  rompe nada del flujo actual: `compactImageToBlob` en el frontend siempre exporta a
  `image/jpeg` de todas formas.
- **`.env.example` / `.env.production.example`**: documentan `COOKIE_SECURE`.

Los otros dos puntos de la Fase 5 del plan ya estaban resueltos por fases anteriores, no
hacía falta tocar código:
- *Generar JWT_SECRET fuerte y único* → cubierto en `.env.production.example` (Fase 2) con
  el comando `openssl rand -hex 32`.
- *Cambiar usuario/contraseña admin sembrados por defecto* → cubierto por
  `ADMIN_INITIAL_USERNAME` / `ADMIN_INITIAL_PASSWORD` + `SEED_SAMPLE_DATA=false` (Fase 2).
- *Límite de tamaño de subida* → ya existía (`multipart.ts`, 5 MB / 1 archivo), no se tocó.

### Pendiente: agregar `COOKIE_SECURE` a las variables de App Service

Si ya corriste el comando de `az webapp config appsettings set` de la Fase 3, agrégale esta
variable (o inclúyela desde el principio si todavía no lo corriste):

```bash
az webapp config appsettings set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --settings COOKIE_SECURE="true"
```

### Verificar en local que nada se rompió

```bash
cd apps/Back
npm audit          # debería decir "found 0 vulnerabilities"
npm run dev         # login/logout del panel admin debe seguir funcionando igual que siempre
```

---

## Fase 6 — Actualizar documentación ✅

A diferencia de las fases 1-5, esta fase no toca código de la aplicación — solo la
documentación, que hasta este punto describía una arquitectura (Cosmos DB / Azure Functions /
Next.js, e incluso antes que eso, AWS/DynamoDB) que nunca llegó a construirse, y que
generaba confusión sobre cuál era el estado real del proyecto.

### Qué cambió

- **`docs/planificacion/roadmap-proyecto.md`** (reescrito): antes describía el plan
  congelado de Next.js + Azure Functions + Cosmos DB como si fuera el estado del proyecto.
  Ahora documenta la pila real (Fastify + PostgreSQL + Vite + Azure App
  Service/Static Web Apps/Blob Storage) y deja un historial explícito de por qué se
  abandonaron tanto esa propuesta como la anterior (AWS + DynamoDB), para que nadie vuelva a
  asumir que están vigentes.
- **`docs/planificacion/plan-migracion-azure.md`** (nuevo): este archivo referenciaba un plan
  que no existía como archivo en el repo — solo vivía en la conversación que originó la
  migración. Se agregó el documento completo (Fases 0-6, todas marcadas como completadas) como
  fuente de verdad de las decisiones de arquitectura.
- **`docs/planificacion/plan-desarrollo-fases-2-11.md`** (marcado como histórico): es el plan
  más antiguo, basado en AWS/DynamoDB, previo incluso a la propuesta de Cosmos DB. Se le agregó
  una nota al inicio dejando explícito que no refleja la arquitectura real, para que se lea
  solo como referencia histórica del backlog de producto, no como documentación técnica vigente.
- **`docs/apps/como-desplegar.md`** (nuevo): guía lineal de despliegue a producción, en el
  mismo estilo que `como-correr.md` pero para Azure real — junta en un solo recorrido los
  comandos que este documento (`despliegue-azure.md`) tiene repartidos fase por fase, más un
  checklist final y una sección de problemas comunes. `despliegue-azure.md` explica **qué
  cambió en el código y por qué**; `como-desplegar.md` explica **qué comandos correr, en qué
  orden**, para dejar el proyecto en línea la primera vez.
- **`docs/apps/README.md`**: se agregaron enlaces a `como-desplegar.md` y a
  `roadmap-proyecto.md` / `plan-migracion-azure.md`, para que la documentación de despliegue
  sea fácil de encontrar desde la puerta de entrada de `docs/apps/`.

### Cómo verificar que la documentación quedó consistente

No hay pasos de Azure CLI en esta fase — es una verificación de lectura:

1. Abre `docs/planificacion/roadmap-proyecto.md` y confirma que describe Fastify + PostgreSQL
   + Vite, no Next.js/Cosmos DB/Functions.
2. Confirma que el enlace a `plan-migracion-azure.md` desde este documento (línea 3, arriba)
   ahora resuelve a un archivo real.
3. Sigue `docs/apps/como-desplegar.md` de principio a fin contra una suscripción de Azure de
   prueba (o revísala mentalmente paso a paso) y confirma que no le falta ningún comando de
   los que sí están en este documento.

