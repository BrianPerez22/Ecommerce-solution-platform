import { buildApp } from './app.js'
import { env } from './env.js'

const app = await buildApp()

try {
  // host 0.0.0.0 y no el localhost por defecto: dentro de un contenedor, escuchar solo
  // en localhost deja el servicio inalcanzable desde fuera y Render lo da por caído.
  await app.listen({ port: env.port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
