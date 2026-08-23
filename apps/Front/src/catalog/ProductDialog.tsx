import { useState } from 'react'
import type { Categoria, Producto } from '../models/seed'
import { formatMoney, getAvailabilityLabel } from '../utils/format'

/** Ventana emergente con el detalle completo de un producto y sus imágenes. */
export function ProductDialog({
  product,
  category,
  onClose,
  onAdd,
}: {
  product: Producto
  category?: Categoria
  onClose: () => void
  onAdd: () => void
}) {
  const [activeImage, setActiveImage] = useState(0)
  const unavailable = !product.activo || product.stock === 0
  const availabilityClass = getAvailabilityLabel(product).replaceAll(' ', '-').toLowerCase()

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={product.nombre}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose}>
          ×
        </button>

        <div className="detail-image">
          <img src={product.imagenes[activeImage]} alt={product.nombre} />
        </div>

        {product.imagenes.length > 1 && (
          <div className="thumbs">
            {product.imagenes.map((imagen, index) => (
              <button key={imagen} onClick={() => setActiveImage(index)}>
                <img src={imagen} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="detail-copy">
          <p className="eyebrow">{category?.nombre}</p>
          <h2>{product.nombre}</h2>
          <p>{product.descripcion}</p>
          <ul>
            {product.caracteristicas.map((caracteristica) => (
              <li key={caracteristica}>{caracteristica}</li>
            ))}
          </ul>
          <div className="detail-action">
            <div>
              <strong className="price">{formatMoney(product.precio)}</strong>
              <span className={'availability ' + availabilityClass}>
                {getAvailabilityLabel(product)}
              </span>
            </div>
            <button className="primary" disabled={unavailable} onClick={onAdd}>
              {unavailable ? 'No disponible' : 'Agregar a mi lista'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
