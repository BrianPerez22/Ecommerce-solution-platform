import { useEffect, useState } from 'react'
import { getPedidos } from '../services/store'
import type { Pedido } from '../models/pedido'
import { formatMoney } from '../utils/format'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

/** Ventana con el historial de pedidos confirmados por los clientes. */
export function Orders({ onClose }: { onClose: () => void }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getPedidos()
      .then(setPedidos)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el historial.'))
  }, [])

  return (
    <div className="modal-backdrop">
      <section className="categories" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Historial de pedidos</h2>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="notice">{error}</p>}
        {!error && !pedidos && <p>Cargando…</p>}
        {!error && pedidos?.length === 0 && <p>Todavía no hay pedidos confirmados.</p>}

        {pedidos && pedidos.length > 0 && (
          <div className="order-list">
            {pedidos.map((pedido) => (
              <div key={pedido.id}>
                <strong>
                  {pedido.codigo} · {formatMoney(pedido.total)}
                </strong>
                <small>
                  {formatDate(pedido.createdAt)}
                  {pedido.clienteNombre ? ` · ${pedido.clienteNombre}` : ''}
                </small>
                <small>
                  {pedido.lineas.map((linea) => `${linea.cantidad}× ${linea.productoNombre}`).join(', ')}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
