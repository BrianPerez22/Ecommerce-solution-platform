import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name}`)
  return value
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  jwtSecret: required('JWT_SECRET'),
}
