import type { Producto } from '../models/seed'

const MAX_ROWS_SHOWN = 10

/** Muestra un resumen de lo que va a crear o actualizar una importación de CSV antes de confirmarla. */
export function CsvPreview({
  list,
  existing,
  onClose,
  onConfirm,
}: {
  list: Producto[]
  existing: Producto[]
  onClose: () => void
  onConfirm: () => void
}) {
  function alreadyExists(producto: Producto) {
    return existing.some((e) => e.id === producto.id)
  }

  const creates = list.filter((p) => !alreadyExists(p))
  const updates = list.length - creates.length

  return (
    <div className="modal-backdrop">
      <section className="csv-modal" role="dialog" aria-modal="true">
        <h2>Revisa la importación</h2>
        <p>
          Se crearán <b>{creates.length}</b> productos y se actualizarán <b>{updates}</b> productos
          con el mismo ID.
        </p>
        <div className="csv-list">
          {list.slice(0, MAX_ROWS_SHOWN).map((producto) => (
            <p key={producto.id}>
              <b>{alreadyExists(producto) ? 'Actualizar' : 'Crear'}</b> · {producto.nombre}
            </p>
          ))}
          {list.length > MAX_ROWS_SHOWN && <p>…y {list.length - MAX_ROWS_SHOWN} más</p>}
        </div>
        <div className="form-footer">
          <button className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" onClick={onConfirm}>
            Confirmar importación
          </button>
        </div>
      </section>
    </div>
  )
}
