import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma.js'
import { createUniqueOrderCode } from '../utils/orderCode.js'
import { HttpError } from '../utils/httpError.js'

type LineaInput = { productoId: string; cantidad: number }
type PedidoBody = { clienteNombre?: string; lineas: LineaInput[] }

function withSubtotal(pedido: {
  lineas: { productoNombre: string; cantidad: number; precioUnitario: number }[]
} & Record<string, unknown>) {
  return {
    ...pedido,
    lineas: pedido.lineas.map((linea) => ({
      ...linea,
      subtotal: linea.cantidad * linea.precioUnitario,
    })),
  }
}

export const pedidoRoutes: FastifyPluginAsync = async (app) => {
  app.get('/pedidos', { onRequest: [app.requireAuth] }, async () => {
    const pedidos = await prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lineas: true },
    })
    return pedidos.map(withSubtotal)
  })

  // Checkout público: lo dispara cualquier visitante del catálogo al confirmar su pedido.
  app.post<{ Body: PedidoBody }>('/pedidos', async (request, reply) => {
    const { clienteNombre, lineas } = request.body

    if (!lineas?.length) {
      throw new HttpError(400, 'El pedido necesita al menos una línea.')
    }
    if (lineas.some((linea) => linea.cantidad <= 0)) {
      throw new HttpError(400, 'Las cantidades del pedido deben ser mayores a cero.')
    }

    const productos = await prisma.producto.findMany({
      where: { id: { in: lineas.map((linea) => linea.productoId) } },
    })

    const lineasConProducto = lineas.map((linea) => {
      const producto = productos.find((p) => p.id === linea.productoId)
      if (!producto) throw new HttpError(400, `El producto ${linea.productoId} no existe.`)
      return { producto, cantidad: linea.cantidad }
    })

    const total = lineasConProducto.reduce(
      (sum, { producto, cantidad }) => sum + producto.precio * cantidad,
      0,
    )

    const codigo = await createUniqueOrderCode(prisma)

    const pedido = await prisma.pedido.create({
      data: {
        codigo,
        clienteNombre: clienteNombre || null,
        total,
        lineas: {
          create: lineasConProducto.map(({ producto, cantidad }) => ({
            productoId: producto.id,
            productoNombre: producto.nombre,
            cantidad,
            precioUnitario: producto.precio,
          })),
        },
      },
      include: { lineas: true },
    })

    return reply.code(201).send(withSubtotal(pedido))
  })
}
