import { useEffect, useState } from 'react'
import {
  getCategorias,
  getCarrito,
  getProductos,
  saveCarrito,
  type CartLine,
} from '../services/store'
import type { Categoria, Producto } from '../models/seed'

/**
 * Carga productos, categorías y el carrito desde el almacenamiento local,
 * y expone funciones para volver a cargarlos o modificar el carrito.
 */
export function useInventory() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cart, setCart] = useState<CartLine[]>([])

  async function refresh() {
    setProductos(await getProductos())
    setCategorias(await getCategorias())
    setCart(await getCarrito())
  }

  useEffect(() => {
    refresh()
  }, [])

  async function updateCart(lines: CartLine[]) {
    await saveCarrito(lines)
    setCart(lines)
  }

  return { productos, categorias, cart, refresh, updateCart }
}
