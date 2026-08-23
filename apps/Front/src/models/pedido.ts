export type LineaPedido = {
  productoId: string | null
  productoNombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export type Pedido = {
  id: string
  codigo: string
  clienteNombre: string | null
  total: number
  createdAt: string
  lineas: LineaPedido[]
}
