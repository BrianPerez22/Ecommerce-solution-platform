import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import { env } from '../env.js'

export const SESSION_COOKIE_NAME = 'sanddy_session'

export async function registerJwt(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.jwtSecret,
    cookie: { cookieName: SESSION_COOKIE_NAME, signed: false },
    sign: { expiresIn: '8h' },
  })

  app.decorate('requireAuth', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ message: 'No autenticado.' })
    }
  })
}
