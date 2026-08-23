import path from 'node:path'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import { env } from '../env.js'

export async function registerStatic(app: FastifyInstance) {
  await app.register(fastifyStatic, {
    root: path.resolve(process.cwd(), env.uploadsDir),
    prefix: '/uploads/',
  })
}
