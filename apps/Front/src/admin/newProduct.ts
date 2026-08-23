import type { Producto } from '../models/seed'
import { generateId } from '../utils/format'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'

/** Crea un producto vacío listo para editar, en la categoría dada. */
export function newProduct(categoriaId: string): Producto {
  return {
    id: 'p-' + generateId(),
    nombre: '',
    descripcion: '',
    caracteristicas: [],
    precio: 0,
    stock: 0,
    categoriaId,
    imagenes: [PLACEHOLDER_IMAGE],
    activo: true,
  }
}
