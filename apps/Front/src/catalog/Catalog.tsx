import { useState } from 'react'
import type { Categoria, Producto } from '../models/seed'
import { ProductCard } from './ProductCard'

/** Página pública del catálogo: buscador, filtro por categoría y grilla de productos. */
export function Catalog({
  productos,
  categorias,
  onAdd,
  onOpen,
}: {
  productos: Producto[]
  categorias: Categoria[]
  onAdd: (producto: Producto) => void
  onOpen: (producto: Producto) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const visibleProducts = productos.filter((producto) => {
    const matchesCategory = selectedCategory === 'all' || producto.categoriaId === selectedCategory
    const matchesSearch = producto.nombre.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="catalog">
      <section className="hero">
        <p className="eyebrow">Belleza y hogar, a un mensaje de distancia</p>
        <h1>Encuentra eso que te hace falta.</h1>
        <p>Explora con calma, arma tu lista y envíala a Sanddy.</p>
      </section>

      <div className="filters">
        <label className="search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca un producto"
          />
        </label>
        <div className="chips">
          <button
            className={selectedCategory === 'all' ? 'selected' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            Todo
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              className={selectedCategory === categoria.id ? 'selected' : ''}
              onClick={() => setSelectedCategory(categoria.id)}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count">{visibleProducts.length} productos para mirar</p>

      {visibleProducts.length > 0 ? (
        <div className="product-grid">
          {visibleProducts.map((producto) => (
            <ProductCard key={producto.id} producto={producto} onAdd={onAdd} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>Todavía no hay productos en esta categoría</h2>
          <p>Prueba con otra categoría o busca por nombre.</p>
        </div>
      )}
    </main>
  )
}
