import Fastify, { type FastifyError } from 'fastify'
import { registerCors } from './plugins/cors.js'
import { registerCookie } from './plugins/cookie.js'
import { registerJwt } from './plugins/jwt.js'
import { registerMultipart } from './plugins/multipart.js'
import { registerStatic } from './plugins/static.js'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { categoriaRoutes } from './routes/categorias.js'
import { productoRoutes } from './routes/productos.js'
import { pedidoRoutes } from './routes/pedidos.js'
import { imagenRoutes } from './routes/imagenes.js'
import { env } from './env.js'
import { HttpError } from './utils/httpError.js'

/**
 * Toda la API cuelga de /api para dejar libre la raíz, que en producción sirve el build
 * del front desde este mismo servidor. El front la llama con `VITE_API_URL=/api`, así
 * que la misma ruta relativa vale en desarrollo (proxy de Vite) y en producción.
 */
const API_PREFIX = '/api'

export async function buildApp() {
  // trustProxy en producción: en Render el TLS lo termina el proxy, y sin esto Fastify
  // registraría la IP del proxy y creería que todas las peticiones llegan por HTTP.
  const app = Fastify({ logger: true, trustProxy: env.isProduction })

  await registerCors(app)
  await registerCookie(app)
  await registerJwt(app)
  await registerMultipart(app)

  app.setErrorHandler((error: FastifyError | HttpError, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ message: error.message })
    }
    // Errores propios de Fastify (body malformado, límites de tamaño, etc.) ya traen
    // su propio código 4xx — respetarlo en vez de aplastarlo con un 500 genérico.
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ message: error.message })
    }
    app.log.error(error)
    return reply.code(500).send({ message: 'Error interno del servidor.' })
  })

  await app.register(healthRoutes, { prefix: API_PREFIX })
  await app.register(authRoutes, { prefix: API_PREFIX })
  await app.register(categoriaRoutes, { prefix: API_PREFIX })
  await app.register(productoRoutes, { prefix: API_PREFIX })
  await app.register(pedidoRoutes, { prefix: API_PREFIX })
  await app.register(imagenRoutes, { prefix: API_PREFIX })

  // Al final: instala el notFound que devuelve el index.html del SPA, y solo debe
  // atrapar lo que ninguna ruta de la API reclamó antes.
  await registerStatic(app)

  return app
}
