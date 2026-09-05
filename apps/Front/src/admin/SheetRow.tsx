import type { Categoria, Producto } from '../models/seed'
import { resolveImagenUrl } from '../services/store'

type EditableField = 'nombre' | 'precio' | 'stock'

/** Una fila editable de la tabla de inventario: nombre, categoría, precio, stock, etc. */
export function SheetRow({
  product,
  categorias,
  onSave,
  onEdit,
  onDelete,
}: {
  product: Producto
  categorias: Categoria[]
  onSave: (p: Producto) => Promise<void>
  onEdit: () => void
  onDelete: () => void
}) {
  function changeField(key: keyof Producto, value: string | boolean) {
    const isNumericField = key === 'precio' || key === 'stock'
    const parsedValue = isNumericField ? Math.max(0, Number(value) || 0) : value
    onSave({ ...product, [key]: parsedValue })
  }

  function renderEditableCell(key: EditableField, value: string | number) {
    return (
      <input
        className={key === 'nombre' ? '' : 'mono'}
        aria-label={key}
        inputMode={key === 'nombre' ? undefined : 'numeric'}
        defaultValue={value}
        onBlur={(e) => changeField(key, e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            e.currentTarget.value = String(value)
            e.currentTarget.blur()
          }
        }}
      />
    )
  }

  return (
    <tr>
      <td>{renderEditableCell('nombre', product.nombre)}</td>
      <td>
        <select
          aria-label="Categoría"
          value={product.categoriaId}
          onChange={(e) => changeField('categoriaId', e.target.value)}
        >
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </td>
      <td>{renderEditableCell('precio', product.precio || '')}</td>
      <td>{renderEditableCell('stock', product.stock || '')}</td>
      <td className="center">
        <input
          aria-label="Activo"
          type="checkbox"
          checked={product.activo}
          onChange={(e) => changeField('activo', e.target.checked)}
        />
      </td>
      <td>
        <button className="image-cell" onClick={onEdit}>
          <img src={resolveImagenUrl(product.imagenes[0])} alt="" />
          Editar
        </button>
      </td>
      <td>
        <button className="icon-button" title="Eliminar producto" onClick={onDelete}>
          ×
        </button>
      </td>
    </tr>
  )
}
