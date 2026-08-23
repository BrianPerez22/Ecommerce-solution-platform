export type Page = 'catalog' | 'admin' | 'cart'

/** Barra superior con el logo, la navegación y el contador de la lista de interés. */
export function Header({
  cartCount,
  onNavigate,
}: {
  cartCount: number
  onNavigate: (page: Page) => void
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('catalog')}>
        <span>Sanddy</span> Almacén
      </button>
      <nav>
        <button onClick={() => onNavigate('catalog')}>Catálogo</button>
        <button onClick={() => onNavigate('admin')} className="admin-link">
          Panel
        </button>
        <button
          className="bag"
          onClick={() => onNavigate('cart')}
          aria-label="Ver lista de interés"
        >
          Lista <b>{cartCount}</b>
        </button>
      </nav>
    </header>
  )
}
