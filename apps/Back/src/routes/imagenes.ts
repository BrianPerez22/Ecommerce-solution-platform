import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma.js'
import { HttpError } from '../utils/httpError.js'

// Solo formatos rasterizados. SVG queda fuera a propósito: es XML, puede llevar un
// <script> dentro y esta ruta lo serviría desde el mismo origen que la API.
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

// El id es único por subida y la fila nunca se reescribe, así que el contenido de una
// URL no cambia nunca y el navegador puede quedarse con la copia para siempre.
const CACHE_UN_ANIO = 'public, max-age=31536000, immutable'

// TODO: nadie borra una imagen cuando se la quita de un producto, cuando se borra el
// producto o cuando el admin cierra el formulario sin guardar, así que las huérfanas se
// acumulan. Con las fotos ya comprimidas por el navegador (~100 KB) y un catálogo
// pequeño no estorba; la consulta de limpieza está en docs/apps/architecture.md.

export const imagenRoutes: FastifyPluginAsync = async (app) => {
  app.post('/imagenes', { onRequest: [app.requireAuth] }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw new HttpError(400, 'No se recibió ningún archivo.')
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      throw new HttpError(400, 'El archivo debe ser una imagen JPG, PNG, WebP, AVIF o GIF.')
    }

    // Al pasarse de `limits.fileSize`, multipart lanza FST_REQ_FILE_TOO_LARGE con el
    // mensaje en inglés; lo traducimos antes de que llegue al manejador global.
    let buffer: Buffer
    try {
      buffer = await file.toBuffer()
    } catch (error) {
      if ((error as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE') {
        throw new HttpError(413, 'La imagen supera el tamaño máximo permitido (5 MB).')
      }
      throw error
    }

    // Red de seguridad por si algún día se configura `throwFileSizeLimit: false`: ahí
    // `toBuffer()` no lanza y devuelve los bytes recortados. Comprobarlo antes de
    // insertar, para no dejar una imagen corrupta en la base.
    if (file.file.truncated) {
      throw new HttpError(413, 'La imagen supera el tamaño máximo permitido (5 MB).')
    }
    if (buffer.byteLength === 0) throw new HttpError(400, 'La imagen llegó vacía.')

    const imagen = await prisma.imagen.create({
      data: {
        mimeType: file.mimetype,
        tamano: buffer.byteLength,
        // Prisma tipa `Bytes` como Uint8Array<ArrayBuffer> y `toBuffer()` devuelve un
        // Buffer<ArrayBufferLike>, que no encaja ahí: hay que copiarlo.
        datos: new Uint8Array(buffer),
      },
      select: { id: true },
    })

    // Ruta relativa a propósito: así el host del entorno no queda escrito en la base.
    return reply.code(201).send({ url: `/imagenes/${imagen.id}` })
  })

  // Pública: la piden los <img> del catálogo, que se ve sin iniciar sesión.
  app.get<{ Params: { id: string } }>('/imagenes/:id', async (request, reply) => {
    const imagen = await prisma.imagen.findUnique({
      where: { id: request.params.id },
      select: { mimeType: true, tamano: true, datos: true },
    })

    // Lanzar antes de tocar las cabeceras: con un Content-Type de imagen ya puesto, el
    // manejador global de app.ts no podría enviar su `{ message }` y saldría un 500.
    if (!imagen) throw new HttpError(404, 'Imagen no encontrada.')

    return reply
      // El Content-Type va antes del send: si no, Fastify manda application/octet-stream.
      .header('Content-Type', imagen.mimeType)
      .header('X-Content-Type-Options', 'nosniff')
      // Fastify recalcula el largo en el GET, pero respeta este valor en el HEAD que
      // autogenera para esta misma ruta.
      .header('Content-Length', imagen.tamano)
      .header('Cache-Control', CACHE_UN_ANIO)
      .send(imagen.datos)
  })
}
