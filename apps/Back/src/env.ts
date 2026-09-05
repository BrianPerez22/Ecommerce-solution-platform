import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name}`)
  return value
}

const isProduction = process.env.NODE_ENV === 'production'

export const env = {
  databaseUrl: required('DATABASE_URL'),
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET'),
  isProduction,
  // Carpeta con el build del front que este mismo servidor sirve en producción. La ruta
  // por defecto es relativa al cwd del backend, así que funciona tanto en el repo como
  // en la imagen de Docker, donde se respeta la misma disposición Back/ + Front/.
  frontendDist: process.env.FRONTEND_DIST ?? '../Front/dist',
  // La cookie de sesión solo puede llevar el flag `Secure` si hay HTTPS: en local no lo
  // hay, y marcarla igual haría que el navegador la descartara y no se pudiera entrar.
  cookieSecure: isProduction,
}
