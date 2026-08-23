import type { FastifyPluginAsync } from 'fastify'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { slugify } from '../utils/slugify.js'
import { HttpError, notFound } from '../utils/httpError.js'

type CategoriaBody = { nombre: string; slug?: string; orden?: number }

export const categoriaRoutes: FastifyPluginAsync = async (app) => {
  app.get('/categorias', async () => {
    return prisma.categoria.findMany({ orderBy: { orden: 'asc' } })
  })

  app.post<{ Body: CategoriaBody }>(
    '/categorias',
    { onRequest: [app.requireAuth] },
    async (request, reply) => {
      const { nombre, slug, orden } = request.body

      const maxOrden = await prisma.categoria.aggregate({ _max: { orden: true } })
      const categoria = await createOrThrowOnDuplicateSlug(() =>
        prisma.categoria.create({
          data: {
            nombre,
            slug: slug || slugify(nombre),
            orden: orden ?? (maxOrden._max.orden ?? 0) + 1,
          },
        }),
      )

      return reply.code(201).send(categoria)
    },
  )

  app.put<{ Params: { id: string }; Body: Partial<CategoriaBody> }>(
    '/categorias/:id',
    { onRequest: [app.requireAuth] },
    async (request) => {
      const { id } = request.params
      const { nombre, slug, orden } = request.body

      return createOrThrowOnDuplicateSlug(() =>
        prisma.categoria.update({
          where: { id },
          data: { nombre, slug, orden },
        }),
      ).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw notFound('Categoría')
        }
        throw error
      })
    },
  )

  app.delete<{ Params: { id: string } }>(
    '/categorias/:id',
    { onRequest: [app.requireAuth] },
    async (request, reply) => {
      const { id } = request.params

      const productCount = await prisma.producto.count({ where: { categoriaId: id } })
      if (productCount > 0) {
        throw new HttpError(409, 'Primero mueve o elimina los productos de esta categoría.')
      }

      await prisma.categoria.delete({ where: { id } }).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw notFound('Categoría')
        }
        throw error
      })

      return reply.code(204).send()
    },
  )
}

async function createOrThrowOnDuplicateSlug<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Ya existe una categoría con ese nombre.')
    }
    throw error
  }
}
