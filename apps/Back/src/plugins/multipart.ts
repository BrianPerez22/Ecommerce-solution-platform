import multipart from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB, red de seguridad para subidas fuera del navegador

export async function registerMultipart(app: FastifyInstance) {
  await app.register(multipart, {
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  })
}
