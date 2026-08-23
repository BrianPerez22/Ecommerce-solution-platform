import { useState } from 'react'
import { getCarrito } from './services/store'
import type { Producto } from './models/seed'
import { useInventory } from './hooks/useInventory'
import { Header, type Page } from './components/Header'
import { WhatsAppButton } from './components/WhatsAppButton'
import { Catalog, ProductDialog, Cart, type CartLineWithProduct } from './catalog'
import { Admin } from './admin'

function App() {
  const { productos, categorias, cart, refresh, updateCart } = useInventory()
  const [page, setPage] = useState<Page>(location.pathname === '/admin' ? 'admin' : 'catalog')
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)

  function goTo(nextPage: Page) {
    setPage(nextPage)
    history.pushState({}, '', nextPage === 'admin' ? '/admin' : '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function addToCart(producto: Producto) {
    if (!producto.activo || producto.stock === 0) return

    // Se relee el carrito por si hay otro cambio en curso, en vez de confiar en el estado local.
    const currentCart = await getCarrito()
    const existingLine = currentCart.find((line) => line.productoId === producto.id)

    const nextCart = existingLine
      ? currentCart.map((line) =>
          line.productoId === producto.id
            ? { ...line, cantidad: Math.min(producto.stock, line.cantidad + 1) }
            : line,
        )
      : [...currentCart, { productoId: producto.id, cantidad: 1 }]

    await updateCart(nextCart)
    setSelectedProduct(null)
  }

  const cartLines: CartLineWithProduct[] = cart
    .map((line) => ({ line, producto: productos.find((p) => p.id === line.productoId) }))
    .filter((entry): entry is CartLineWithProduct => !!entry.producto)

  const cartCount = cart.reduce((sum, line) => sum + line.cantidad, 0)
  const selectedProductCategory = selectedProduct
    ? categorias.find((c) => c.id === selectedProduct.categoriaId)
    : undefined

  return (
    <>
      <Header cartCount={cartCount} onNavigate={goTo} />

      {page === 'catalog' && (
        <Catalog
          productos={productos}
          categorias={categorias}
          onAdd={addToCart}
          onOpen={setSelectedProduct}
        />
      )}

      {page === 'cart' && <Cart lines={cartLines} onChangeCart={updateCart} onNavigate={goTo} />}

      {page === 'admin' && (
        <Admin productos={productos} categorias={categorias} refresh={refresh} />
      )}

      {selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          category={selectedProductCategory}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => addToCart(selectedProduct)}
        />
      )}

      {page !== 'admin' && <WhatsAppButton />}
    </>
  )
}

export default App
