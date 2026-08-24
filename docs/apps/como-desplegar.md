# Cómo desplegar Sanddy Almacén a Azure (producción)

Esta guía asume que ya seguiste [`como-correr.md`](./como-correr.md) y el proyecto te
funciona en local. Aquí vas a crear los recursos **reales** de Azure y dejar el backend, la
base de datos, el storage de imágenes y el frontend en línea.

El código ya está preparado para esto (ver [`despliegue-azure.md`](./despliegue-azure.md)
para el detalle de qué se cambió y por qué). Esta guía solo junta los pasos en el orden en
que hay que ejecutarlos, con los comandos ya usados de principio a fin.

## Requisitos

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) instalado y logueado (`az login`).
- Una suscripción de Azure activa.
- El repositorio en GitHub (para conectar los pipelines de CI/CD).
- `openssl` disponible en tu terminal (para generar el `JWT_SECRET`).

> Los nombres de recursos usados abajo (`rg-sanddy-almacen`, `sanddy-almacen-db`, etc.) son
> ejemplos. Los nombres de cuentas de Storage y de App Service deben ser **únicos
> globalmente** en Azure — si ya están tomados, cámbialos consistentemente en todos los
> comandos.

---

## Paso 1 — Grupo de recursos

Todo lo que crees en los pasos siguientes vive dentro de este grupo, para poder
administrarlo (y borrarlo) como una sola unidad.

```bash
az group create --name rg-sanddy-almacen --location eastus
```

## Paso 2 — Imágenes: Azure Blob Storage

```bash
az storage account create \
  --name sanddyalmacenstorage \
  --resource-group rg-sanddy-almacen \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

az storage container create \
  --account-name sanddyalmacenstorage \
  --name productos \
  --public-access blob \
  --auth-mode login

az storage account show-connection-string \
  --name sanddyalmacenstorage \
  --resource-group rg-sanddy-almacen
```

Guarda el `connectionString` que devuelve el último comando — lo necesitas en el Paso 5.

## Paso 3 — Base de datos: Azure Database for PostgreSQL

```bash
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

az postgres flexible-server db create \
  --resource-group rg-sanddy-almacen \
  --server-name sanddy-almacen-db \
  --database-name sanddy_almacen

az postgres flexible-server firewall-rule create \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Tu `DATABASE_URL` de producción queda:

```
postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require
```

### Aplicar migraciones y sembrar el usuario admin (desde tu máquina, sin tocar tu `.env` local)

```bash
cd apps/Back

DATABASE_URL="postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require" \
  npm run prisma:migrate:deploy

DATABASE_URL="postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require" \
  SEED_SAMPLE_DATA=false \
  ADMIN_INITIAL_USERNAME="<usuario real, no 'sanddy'>" \
  ADMIN_INITIAL_PASSWORD="<password real, no 'sanddy2026'>" \
  npm run prisma:seed
```

`SEED_SAMPLE_DATA=false` crea solo el usuario admin, sin el catálogo de ejemplo. Si prefieres
partir con productos de ejemplo para no arrancar de cero, usa `SEED_SAMPLE_DATA=true` y
edítalos/bórralos después desde `/admin`.

## Paso 4 — Generar el secreto de sesión

```bash
openssl rand -hex 32
```

Guarda el resultado — es tu `JWT_SECRET` de producción. No reutilices el `dev-secret-...` de
tu `.env` local.

## Paso 5 — Backend: Azure App Service

```bash
az appservice plan create \
  --resource-group rg-sanddy-almacen \
  --name plan-sanddy-almacen \
  --is-linux \
  --sku B1

az webapp create \
  --resource-group rg-sanddy-almacen \
  --plan plan-sanddy-almacen \
  --name sanddy-almacen-api \
  --runtime "NODE:20-lts"

az webapp config appsettings set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --settings \
    DATABASE_URL="postgresql://sanddyadmin:<password>@sanddy-almacen-db.postgres.database.azure.com:5432/sanddy_almacen?sslmode=require" \
    STORAGE_DRIVER="azure" \
    AZURE_STORAGE_CONNECTION_STRING="<connection string del Paso 2>" \
    AZURE_STORAGE_CONTAINER="productos" \
    JWT_SECRET="<generado en el Paso 4>" \
    ADMIN_INITIAL_USERNAME="<usuario real>" \
    ADMIN_INITIAL_PASSWORD="<password real>" \
    COOKIE_SECURE="true" \
    CORS_ORIGIN="https://sanddy-almacen-web.azurestaticapps.net"

az webapp config set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --startup-file "node dist/server.js"

az webapp config set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --generic-configurations '{"healthCheckPath": "/health"}'
```

> El `CORS_ORIGIN` de arriba es un placeholder — todavía no existe el Static Web App del Paso
> 6. Vuelve a este comando y actualízalo con el dominio real una vez que lo tengas (último
> paso del Paso 6).

### Conectar el pipeline de GitHub Actions del backend

1. Azure Portal → App Service `sanddy-almacen-api` → **Deployment Center** → **Manage
   publish profile** → descargar el `.PublishSettings`.
2. GitHub → `Settings` → `Secrets and variables` → `Actions` → nuevo secret
   `AZURE_WEBAPP_PUBLISH_PROFILE`, pegar el contenido del archivo.
3. Cualquier push a `main` que toque `apps/Back/` dispara `.github/workflows/deploy-backend.yml`
   automáticamente.

### Probar

```bash
curl https://sanddy-almacen-api.azurewebsites.net/health
```

Debería responder `{"status":"ok"}`. Si no responde, revisa `startup-file` y que
`host: '0.0.0.0'` esté en `server.ts` (ya lo está). Si responde `{"status":"error"}`, revisa
`DATABASE_URL` y el firewall del Paso 3.

## Paso 6 — Frontend: Azure Static Web Apps

```bash
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

Esto conecta el repo y crea el secret `AZURE_STATIC_WEB_APPS_API_TOKEN` en GitHub
automáticamente. Si Azure genera su propio workflow YAML, reemplázalo por el que ya trae el
repo (`.github/workflows/deploy-frontend.yml`), que maneja bien `VITE_API_URL`.

Falta agregar a mano en GitHub → `Settings` → `Secrets and variables` → `Actions`:

- **Nombre:** `VITE_API_URL`
- **Valor:** `https://sanddy-almacen-api.azurewebsites.net` (URL real del Paso 5)

Y actualizar el `CORS_ORIGIN` del backend con el dominio real que te asignó Static Web Apps:

```bash
az webapp config appsettings set \
  --resource-group rg-sanddy-almacen \
  --name sanddy-almacen-api \
  --settings CORS_ORIGIN="https://<nombre-generado-por-azure>.azurestaticapps.net"
```

### Probar

Abre la URL del Static Web App. Deberías ver el catálogo público con productos reales.
Entra directo a `/admin` pegando la URL (no navegando desde adentro) para confirmar que no
da 404, e inicia sesión con el usuario admin real sembrado en el Paso 3.

---

## Checklist final antes de compartir la URL con Sandra

- [ ] `/health` del backend responde `{"status":"ok"}`.
- [ ] El catálogo público carga productos reales (no los de ejemplo, salvo que los quieras).
- [ ] El login de `/admin` funciona y la sesión persiste entre refrescos (confirma que
      `COOKIE_SECURE=true` quedó seteado — si no, el login "funciona" pero no persiste).
- [ ] Subir una imagen de producto desde `/admin` la deja en Blob Storage, no en disco local.
- [ ] `ADMIN_INITIAL_USERNAME` / `ADMIN_INITIAL_PASSWORD` son credenciales reales, no
      `sanddy` / `sanddy2026`.
- [ ] `npm audit` en `apps/Back` reporta 0 vulnerabilidades.

## Problemas comunes

**El login funciona (200) pero al refrescar parece que no quedé logueado**
Falta `COOKIE_SECURE=true` en las variables de App Service — sin eso, el navegador descarta
la cookie entre dominios distintos (frontend y backend viven en dominios separados en
producción).

**El catálogo carga vacío o hay errores de red en la consola**
Desajuste entre `VITE_API_URL` (a dónde llama el frontend) y `CORS_ORIGIN` (a quién deja
llamar el backend). Revisa que ambos apunten a las URLs reales, sin `localhost` en ningún
lado.

**`/health` no responde (timeout o 502)**
Revisa el `startup-file` (`node dist/server.js`) y que el build (`npm run build`) se haya
ejecutado en el pipeline antes del deploy.

**Quiero borrar todo y volver a empezar**
```bash
az group delete --name rg-sanddy-almacen --yes --no-wait
```
Esto borra *todos* los recursos de Azure creados en esta guía (App Service, Static Web App,
Postgres, Storage) de una sola vez. Los secrets de GitHub Actions hay que borrarlos aparte,
a mano.
