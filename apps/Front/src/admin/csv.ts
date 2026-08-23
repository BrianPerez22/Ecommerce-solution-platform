import type { ChangeEvent } from 'react'
import type { Categoria, Producto } from '../models/seed'
import { generateId } from '../utils/format'

const CSV_HEADER = 'id,nombre,categoria,precio,stock,activo,descripcion,caracteristicas,imagen'

/** Envuelve un valor entre comillas dobles, escapando las comillas internas. */
function escapeCsvValue(value: string | number | boolean): string {
  return `"${String(value).replaceAll('"', '""')}"`
}

/** Descarga el inventario actual como un archivo CSV. */
export function exportCsv(productos: Producto[], categorias: Categoria[]) {
  const rows = productos.map((producto) => {
    const categoria = categorias.find((c) => c.id === producto.categoriaId)
    const fields = [
      producto.id,
      producto.nombre,
      categoria?.nombre || '',
      producto.precio,
      producto.stock,
      producto.activo,
      producto.descripcion,
      producto.caracteristicas.join('|'),
      producto.imagenes.join('|'),
    ]
    return fields.map(escapeCsvValue).join(',')
  })

  const csvContent = [CSV_HEADER, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'sanddy-inventario.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Parsea texto CSV en filas de celdas, respetando comillas dobles (incluidas comillas
 * escapadas como "" y saltos de línea dentro de una celda entre comillas).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let insideQuotes = false

  function endCell() {
    currentRow.push(currentCell)
    currentCell = ''
  }

  function endRow() {
    endCell()
    if (currentRow.some(Boolean)) rows.push(currentRow)
    currentRow = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentCell += '"' // comilla escapada dentro de una celda entrecomillada
      i++
    } else if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === ',' && !insideQuotes) {
      endCell()
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++ // trata \r\n como un solo salto de línea
      endRow()
    } else {
      currentCell += char
    }
  }
  endRow() // la última fila no termina con un salto de línea

  return rows
}

/** Busca el valor de una columna por nombre dentro de una fila ya parseada. */
function cellByColumnName(row: string[], columns: string[], columnName: string): string {
  return row[columns.indexOf(columnName)] || ''
}

/** Convierte una fila del CSV en un producto, resolviendo la categoría por nombre. */
function rowToProducto(row: string[], columns: string[], categorias: Categoria[]): Producto {
  const categoryName = cellByColumnName(row, columns, 'categoria')
  const matchedCategory = categorias.find(
    (c) => c.nombre.toLowerCase() === categoryName.toLowerCase(),
  )

  return {
    id: cellByColumnName(row, columns, 'id') || 'p-' + generateId(),
    nombre: cellByColumnName(row, columns, 'nombre'),
    categoriaId: matchedCategory?.id || categorias[0]?.id || '',
    precio: Number(cellByColumnName(row, columns, 'precio')) || 0,
    stock: Number(cellByColumnName(row, columns, 'stock')) || 0,
    activo: cellByColumnName(row, columns, 'activo').toLowerCase() !== 'false',
    descripcion: cellByColumnName(row, columns, 'descripcion'),
    caracteristicas: cellByColumnName(row, columns, 'caracteristicas').split('|').filter(Boolean),
    imagenes: cellByColumnName(row, columns, 'imagen').split('|').filter(Boolean),
  }
}

/** Lee el archivo CSV elegido por el usuario y entrega la lista de productos para previsualizar. */
export async function readCsvFile(
  event: ChangeEvent<HTMLInputElement>,
  onParsed: (productos: Producto[] | null) => void,
  categorias: Categoria[],
) {
  const file = event.target.files?.[0]
  if (!file) return

  const rows = parseCsv(await file.text())
  const headerRow = rows.shift()
  if (!headerRow) return

  const columns = headerRow.map((column) => column.trim().toLowerCase())
  const productos = rows.map((row) => rowToProducto(row, columns, categorias))
  onParsed(productos)
}
