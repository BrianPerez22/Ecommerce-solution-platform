import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name}`)
  return value
}

type StorageDriver = 'local' | 'azure'

function storageDriverFromEnv(): StorageDriver {
  const raw = process.env.STORAGE_DRIVER ?? 'local'
  if (raw !== 'local' && raw !== 'azure') {
    throw new Error(`STORAGE_DRIVER inválido: "${raw}". Debe ser "local" o "azure".`)
  }
  return raw
}

const storageDriver = storageDriverFromEnv()

// CORS_ORIGIN acepta uno o varios orígenes separados por coma (ej. tu dominio propio +
// el dominio *.azurestaticapps.net que Azure Static Web Apps asigna por defecto).
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const env = {
  databaseUrl: required('DATABASE_URL'),
  port: Number(process.env.PORT ?? 3001),
  corsOrigins,
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  jwtSecret: required('JWT_SECRET'),
  storageDriver,
  // Solo obligatoria si storageDriver === 'azure'; en 'local' no se valida ni se usa.
  azureStorageConnectionString:
    storageDriver === 'azure' ? required('AZURE_STORAGE_CONNECTION_STRING') : undefined,
  azureStorageContainer: process.env.AZURE_STORAGE_CONTAINER ?? 'productos',
  // En local (HTTP) debe quedar en false. En producción (HTTPS, App Service + Static Web
  // Apps en dominios distintos) debe ser true — ver nota en plugins/../routes/auth.ts.
  cookieSecure: process.env.COOKIE_SECURE === 'true',
}
