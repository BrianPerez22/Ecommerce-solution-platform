import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import { env } from '../env.js'

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, { origin: env.corsOrigin, credentials: true })
}
