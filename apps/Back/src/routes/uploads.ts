import type { FastifyPluginAsync } from 'fastify'
import { HttpError } from '../utils/httpError.js'
import { saveUpload } from '../services/storage.js'

// Lista blanca explícita en vez de "cualquier image/*": excluye a propósito
// image/svg+xml, que es XML y puede llevar <script> embebido (XSS si el navegador
// llega a abrir el blob directamente en vez de solo usarlo como <img src>).
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.post('/uploads', { onRequest: [app.requireAuth] }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw new HttpError(400, 'No se recibió ningún archivo.')
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new HttpError(400, 'La imagen debe ser JPEG, PNG o WEBP.')
    }

    const url = await saveUpload({
      filename: file.filename,
      mimetype: file.mimetype,
      stream: file.file,
    })

    if (file.file.truncated) {
      throw new HttpError(413, 'La imagen supera el tamaño máximo permitido.')
    }

    return reply.code(201).send({ url })
  })
}
