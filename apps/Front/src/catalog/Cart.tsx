import { useState } from 'react'
import QRCode from 'qrcode'
import { crearPedido, type CartLine } from '../services/store'
import type { Pedido } from '../models/pedido'
import type { Producto } from '../models/seed'
import type { Page } from '../components/Header'
import { WHATSAPP_NUMBER } from '../components/WhatsAppButton'
import { formatMoney } from '../utils/format'

export type CartLineWithProduct = { line: CartLine; producto: Producto }

/** Arma el mensaje de texto del pedido confirmado, listo para enviar por WhatsApp o copiar. */
function buildOrderMessage(pedido: Pedido): string {
  const header = `Pedido ${pedido.codigo} — Sanddy Almacén`
  const customer = pedido.clienteNombre ? `Cliente: ${pedido.clienteNombre}\n` : ''
  const items = pedido.lineas
    .map(
      (linea) =>
        `• ${linea.cantidad} × ${linea.productoNombre} — ${formatMoney(linea.subtotal)}`,
    )
    .join('\n')
  return `${header}\n${customer}${items}\nTotal estimado: ${formatMoney(pedido.total)}`
}

/** Página de la lista de interés: revisar cantidades, confirmar y generar el ticket con QR. */
export function Cart({
  lines,
  onChangeCart,
  onNavigate,
}: {
  lines: CartLineWithProduct[]
  onChangeCart: (lines: CartLine[]) => void
  onNavigate: (page: Page) => void
}) {
  const [name, setName] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState<Pedido | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const total = lines.reduce((sum, { line, producto }) => sum + producto.precio * line.cantidad, 0)

  function changeQuantity(productoId: string, delta: number) {
    const nextLines = lines
      .map(({ line }) =>
        line.productoId === productoId ? { ...line, cantidad: line.cantidad + delta } : line,
      )
      .filter((line) => line.cantidad > 0)
    onChangeCart(nextLines)
  }

  async function confirmOrder() {
    setSubmitting(true)
    setError('')
    try {
      const pedido = await crearPedido({
        clienteNombre: name || undefined,
        lineas: lines.map(({ line, producto }) => ({
          productoId: producto.id,
          cantidad: line.cantidad,
        })),
      })
      const message = buildOrderMessage(pedido)
      const qr = await QRCode.toDataURL(message, {
        width: 180,
        margin: 1,
        color: { dark: '#1E1A2B', light: '#F2EFF7' },
      })
      setConfirmedOrder(pedido)
      setQrDataUrl(qr)
      onChangeCart([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos confirmar el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmedOrder) {
    const message = buildOrderMessage(confirmedOrder)
    return (
      <main className="narrow">
        <section className="ticket">
          <p className="eyebrow">Pedido listo</p>
          <h1>{confirmedOrder.codigo}</h1>
          <p>
            {confirmedOrder.clienteNombre
              ? `Gracias, ${confirmedOrder.clienteNombre}.`
              : 'Tu lista ya está organizada.'}
          </p>
          <div className="ticket-lines">
            {confirmedOrder.lineas.map((linea, index) => (
              <p key={index}>
                <span>
                  {linea.cantidad} × {linea.productoNombre}
                </span>
                <b>{formatMoney(linea.subtotal)}</b>
              </p>
            ))}
          </div>
          <p className="ticket-total">
            Total estimado <b>{formatMoney(confirmedOrder.total)}</b>
          </p>
          {qrDataUrl && <img className="qr" src={qrDataUrl} alt="Código QR del pedido" />}
          <div className="ticket-actions">
            <a
              className="primary"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
            >
              Enviar por WhatsApp
            </a>
            <button className="secondary" onClick={() => navigator.clipboard.writeText(message)}>
              Copiar como texto
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="narrow list-page">
      <p className="eyebrow">Tu selección</p>
      <h1>Lista de interés</h1>

      {lines.length === 0 ? (
        <div className="empty">
          <h2>Tu lista está esperando</h2>
          <p>Agrega productos del catálogo para enviarlos juntos.</p>
          <button className="primary" onClick={() => onNavigate('catalog')}>
            Ver catálogo
          </button>
        </div>
      ) : (
        <>
          <div className="cart-lines">
            {lines.map(({ line, producto }) => (
              <article key={producto.id}>
                <img src={producto.imagenes[0]} alt="" />
                <div>
                  <h2>{producto.nombre}</h2>
                  <p className="price">{formatMoney(producto.precio)}</p>
                </div>
                <div className="quantity">
                  <button aria-label="Restar" onClick={() => changeQuantity(producto.id, -1)}>
                    −
                  </button>
                  <b>{line.cantidad}</b>
                  <button
                    aria-label="Sumar"
                    disabled={line.cantidad >= producto.stock}
                    onClick={() => changeQuantity(producto.id, 1)}
                  >
                    +
                  </button>
                </div>
                <strong>{formatMoney(producto.precio * line.cantidad)}</strong>
              </article>
            ))}
          </div>

          <label className="field">
            <span>
              ¿Cómo te llamas? <em>(opcional)</em>
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </label>

          <div className="cart-total">
            <span>Total estimado</span>
            <b className="price">{formatMoney(total)}</b>
          </div>

          {error && <p className="notice">{error}</p>}

          <button className="primary wide" disabled={submitting} onClick={confirmOrder}>
            {submitting ? 'Confirmando…' : 'Confirmar y preparar pedido'}
          </button>
        </>
      )}
    </main>
  )
}
