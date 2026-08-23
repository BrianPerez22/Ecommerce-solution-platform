import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../env.js'
import { HttpError } from '../utils/httpError.js'

// TODO: si se necesita más adelante generar miniaturas o garantizar compresión
// server-side (el navegador ya comprime antes de subir), evaluar `sharp` aquí.

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.post('/uploads', { onRequest: [app.requireAuth] }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw new HttpError(400, 'No se recibió ningún archivo.')
    if (!file.mimetype.startsWith('image/')) {
      throw new HttpError(400, 'El archivo debe ser una imagen.')
    }

    const extension = path.extname(file.filename) || '.jpg'
    const fileName = `${randomUUID()}${extension}`
    const destination = path.resolve(process.cwd(), env.uploadsDir, fileName)

    await pipeline(file.file, createWriteStream(destination))

    if (file.file.truncated) {
      throw new HttpError(413, 'La imagen supera el tamaño máximo permitido.')
    }

    return reply.code(201).send({ url: `/uploads/${fileName}` })
  })
}
