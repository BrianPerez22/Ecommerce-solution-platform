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
import { uploadRoutes } from './routes/uploads.js'
import { HttpError } from './utils/httpError.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await registerCors(app)
  await registerCookie(app)
  await registerJwt(app)
  await registerMultipart(app)
  await registerStatic(app)

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

  await app.register(healthRoutes)
  await app.register(authRoutes)
  await app.register(categoriaRoutes)
  await app.register(productoRoutes)
  await app.register(pedidoRoutes)
  await app.register(uploadRoutes)

  return app
}
