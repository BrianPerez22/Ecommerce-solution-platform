import { buildApp } from './app.js'
import { env } from './env.js'

const app = await buildApp()

try {
  // host: '0.0.0.0' es obligatorio para Azure App Service (y contenedores en general):
  // el valor por defecto de Fastify, 127.0.0.1, solo acepta conexiones desde dentro del
  // mismo contenedor, y el proxy de App Service llega desde fuera. En tu Mac 0.0.0.0
  // también funciona igual que localhost, así que no cambia nada en desarrollo.
  await app.listen({ port: env.port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
