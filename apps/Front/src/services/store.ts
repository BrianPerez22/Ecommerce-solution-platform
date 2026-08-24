import type { Categoria, Producto } from '../models/seed'
import type { Pedido } from '../models/pedido'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/** Llama a la API del backend y lanza un Error con el mensaje del servidor si la respuesta falla. */
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const isJsonBody = typeof options?.body === 'string'
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: isJsonBody ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || `Error de red (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export async function getProductos(): Promise<Producto[]> {
  return api<Producto[]>('/productos')
}

export async function getCategorias(): Promise<Categoria[]> {
  const categorias = await api<Categoria[]>('/categorias')
  return categorias.sort((a, b) => a.orden - b.orden)
}

/** Crea o actualiza un producto: intenta actualizar por id y, si no existe, lo crea. */
export async function saveProducto(producto: Producto): Promise<Producto> {
  try {
    return await api<Producto>(`/productos/${producto.id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
    })
  } catch {
    return api<Producto>('/productos', { method: 'POST', body: JSON.stringify(producto) })
  }
}

export async function deleteProducto(id: string): Promise<void> {
  await api<void>(`/productos/${id}`, { method: 'DELETE' })
}

/** Crea o actualiza una categoría: intenta actualizar por id y, si no existe, la crea. */
export async function saveCategoria(categoria: Categoria): Promise<Categoria> {
  try {
    return await api<Categoria>(`/categorias/${categoria.id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    })
  } catch {
    return api<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(categoria) })
  }
}

export async function deleteCategoria(id: string): Promise<void> {
  await api<void>(`/categorias/${id}`, { method: 'DELETE' })
}

/**
 * Sube una imagen ya comprimida al backend y devuelve su URL pública.
 * El backend puede responder con una ruta relativa (`/uploads/x.jpg`, storage local)
 * o con una URL absoluta (`https://...blob.core.windows.net/...`, Azure Blob Storage).
 * Solo anteponemos API_URL en el primer caso; nunca sabemos ni nos importa cuál es.
 */
export async function uploadImagen(blob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('file', blob, 'imagen.jpg')
  const { url } = await api<{ url: string }>('/uploads', { method: 'POST', body: formData })
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

export async function getPedidos(): Promise<Pedido[]> {
  return api<Pedido[]>('/pedidos')
}

export async function crearPedido(input: {
  clienteNombre?: string
  lineas: { productoId: string; cantidad: number }[]
}): Promise<Pedido> {
  return api<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(input) })
}

export async function login(username: string, password: string): Promise<{ username: string }> {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export async function logout(): Promise<void> {
  await api<void>('/auth/logout', { method: 'POST' })
}

/** Devuelve el usuario de la sesión activa, o null si no hay ninguna (no lanza en ese caso). */
export async function getCurrentUser(): Promise<{ username: string } | null> {
  try {
    return await api('/auth/me')
  } catch {
    return null
  }
}

export type CartLine = { productoId: string; cantidad: number }

const CARRITO_KEY = 'sanddy.carrito'

export async function getCarrito(): Promise<CartLine[]> {
  try {
    const raw = localStorage.getItem(CARRITO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function saveCarrito(lines: CartLine[]): Promise<CartLine[]> {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(lines))
  return lines
}
