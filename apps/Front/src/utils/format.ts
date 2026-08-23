import type { Producto } from '../models/seed'

/** Formatea un número como precio en pesos colombianos, sin decimales. Ej: 45900 -> "$ 45.900". */
export function formatMoney(value: number): string {
  const formatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
  return '$ ' + formatter.format(value)
}

/** Describe la disponibilidad de un producto para mostrarla en la interfaz. */
export function getAvailabilityLabel(producto: Producto): string {
  if (!producto.activo || producto.stock === 0) return 'Agotado'
  if (producto.stock <= 3) return 'Últimas unidades'
  return 'Disponible'
}

// Rango Unicode de las marcas de acento combinables que deja normalize('NFD').
const COMBINING_DIACRITICS = /[̀-ͯ]/g

/** Convierte un texto en un slug apto para URLs o ids: minúsculas, sin tildes ni símbolos. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Genera un identificador corto y aleatorio (7 caracteres alfanuméricos). */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}
