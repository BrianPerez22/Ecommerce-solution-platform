import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma.js'

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: 'ok' }
    } catch {
      return reply.code(503).send({ status: 'error', message: 'No hay conexión con la base de datos.' })
    }
  })
}
