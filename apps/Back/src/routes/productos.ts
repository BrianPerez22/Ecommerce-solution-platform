import type { FastifyPluginAsync } from 'fastify'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { HttpError, notFound } from '../utils/httpError.js'

type ProductoBody = {
  id?: string
  nombre: string
  descripcion?: string
  caracteristicas?: string[]
  precio?: number
  stock?: number
  categoriaId: string
  imagenes?: string[]
  activo?: boolean
}

async function assertCategoriaExists(categoriaId: string) {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } })
  if (!categoria) throw new HttpError(400, 'La categoría indicada no existe.')
}

/** Convierte a un entero >= 0 (por defecto 0 si no se envía), o lanza un 400 legible si no es numérico. */
function toNonNegativeInt(value: unknown, field: string): number {
  if (value === undefined) return 0
  const n = Number(value)
  if (!Number.isFinite(n)) throw new HttpError(400, `El campo "${field}" debe ser numérico.`)
  return Math.max(0, Math.trunc(n))
}

export const productoRoutes: FastifyPluginAsync = async (app) => {
  app.get('/productos', async () => {
    return prisma.producto.findMany({ orderBy: { createdAt: 'asc' } })
  })

  app.post<{ Body: ProductoBody }>(
    '/productos',
    { onRequest: [app.requireAuth] },
    async (request, reply) => {
      const body = request.body
      await assertCategoriaExists(body.categoriaId)

      const producto = await prisma.producto.create({
        data: {
          ...(body.id ? { id: body.id } : {}),
          nombre: body.nombre,
          descripcion: body.descripcion ?? '',
          caracteristicas: body.caracteristicas ?? [],
          precio: toNonNegativeInt(body.precio, 'precio'),
          stock: toNonNegativeInt(body.stock, 'stock'),
          categoriaId: body.categoriaId,
          imagenes: body.imagenes ?? [],
          activo: body.activo ?? true,
        },
      })

      return reply.code(201).send(producto)
    },
  )

  app.put<{ Params: { id: string }; Body: ProductoBody }>(
    '/productos/:id',
    { onRequest: [app.requireAuth] },
    async (request) => {
      const { id } = request.params
      const body = request.body
      await assertCategoriaExists(body.categoriaId)

      return prisma.producto
        .update({
          where: { id },
          data: {
            nombre: body.nombre,
            descripcion: body.descripcion ?? '',
            caracteristicas: body.caracteristicas ?? [],
            precio: toNonNegativeInt(body.precio, 'precio'),
            stock: toNonNegativeInt(body.stock, 'stock'),
            categoriaId: body.categoriaId,
            imagenes: body.imagenes ?? [],
            activo: body.activo ?? true,
          },
        })
        .catch((error) => {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw notFound('Producto')
          }
          throw error
        })
    },
  )

  app.delete<{ Params: { id: string } }>(
    '/productos/:id',
    { onRequest: [app.requireAuth] },
    async (request, reply) => {
      const { id } = request.params

      await prisma.producto.delete({ where: { id } }).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw notFound('Producto')
        }
        throw error
      })

      return reply.code(204).send()
    },
  )
}
