import type { Producto } from '../models/seed'
import { resolveImagenUrl } from '../services/store'
import { formatMoney, getAvailabilityLabel } from '../utils/format'

/** Convierte "Últimas unidades" en la clase CSS "ultimas-unidades", por ejemplo. */
function availabilityClass(producto: Producto): string {
  return getAvailabilityLabel(producto).replaceAll(' ', '-').toLowerCase()
}

/** Tarjeta de producto en la grilla del catálogo. */
export function ProductCard({
  producto,
  onAdd,
  onOpen,
}: {
  producto: Producto
  onAdd: (producto: Producto) => void
  onOpen: (producto: Producto) => void
}) {
  const unavailable = !producto.activo || producto.stock === 0

  return (
    <article className={'product-card ' + (unavailable ? 'sold' : '')}>
      <button className="card-image" onClick={() => onOpen(producto)}>
        <img src={resolveImagenUrl(producto.imagenes[0])} alt={producto.nombre} />
        <span className={'availability ' + availabilityClass(producto)}>
          {getAvailabilityLabel(producto)}
        </span>
      </button>
      <div className="card-content">
        <button className="product-name" onClick={() => onOpen(producto)}>
          {producto.nombre}
        </button>
        <div className="card-bottom">
          <span className="price">{formatMoney(producto.precio)}</span>
          <button className="add" disabled={unavailable} onClick={() => onAdd(producto)}>
            {unavailable ? 'No disponible' : 'Agregar +'}
          </button>
        </div>
      </div>
    </article>
  )
}
