import { useEffect, useState, type FormEvent } from 'react'
import { deleteProducto, getCurrentUser, login, logout, saveProducto } from '../services/store'
import type { Categoria, Producto } from '../models/seed'
import { SheetRow } from './SheetRow'
import { ProductForm } from './ProductForm'
import { Categories } from './Categories'
import { CsvPreview } from './CsvPreview'
import { Orders } from './Orders'
import { exportCsv, readCsvFile } from './csv'
import { newProduct } from './newProduct'

const MESSAGE_DURATION_MS = 1800

/** Formulario de acceso mostrado antes de entrar al panel de administración. */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login(username, password)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <main className="login">
      <section>
        <p className="eyebrow">Solo para Sanddy</p>
        <h1>Panel de administración</h1>
        <p>Ingresa tus credenciales para editar tu vitrina.</p>
        <form onSubmit={handleSubmit}>
          <input
            aria-label="Usuario"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            aria-label="Contraseña"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary">Entrar al panel</button>
        </form>
        {error && <p className="notice">{error}</p>}
      </section>
    </main>
  )
}

/** Panel de administración: inventario editable en tabla, categorías e importar/exportar CSV. */
export function Admin({
  productos,
  categorias,
  refresh,
}: {
  productos: Producto[]
  categorias: Categoria[]
  refresh: () => Promise<void>
}) {
  const [session, setSession] = useState<'checking' | 'in' | 'out'>('checking')
  const [message, setMessage] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [csvPreview, setCsvPreview] = useState<Producto[] | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setMessage(''), MESSAGE_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [message])

  useEffect(() => {
    getCurrentUser().then((usuario) => setSession(usuario ? 'in' : 'out'))
  }, [])

  function reportError(error: unknown) {
    setMessage(error instanceof Error ? error.message : 'Ocurrió un error inesperado.')
  }

  async function save(producto: Producto) {
    try {
      await saveProducto(producto)
      await refresh()
      setMessage('Guardado')
    } catch (error) {
      reportError(error)
    }
  }

  async function handleDelete(producto: Producto) {
    if (!confirm(`¿Eliminar ${producto.nombre}?`)) return
    try {
      await deleteProducto(producto.id)
      await refresh()
    } catch (error) {
      reportError(error)
    }
  }

  async function addBlankProduct() {
    try {
      const producto = newProduct(categorias[0]?.id || '')
      await saveProducto(producto)
      await refresh()
      setEditingProduct(producto)
    } catch (error) {
      reportError(error)
    }
  }

  async function confirmCsvImport() {
    if (!csvPreview) return
    try {
      for (const producto of csvPreview) await saveProducto(producto)
      await refresh()
      setCsvPreview(null)
      setMessage('Importación terminada')
    } catch (error) {
      reportError(error)
    }
  }

  if (session === 'checking') {
    return (
      <main className="login">
        <p>Verificando sesión…</p>
      </main>
    )
  }
  if (session === 'out') {
    return <AdminLogin onLogin={() => setSession('in')} />
  }

  const visibleProducts = productos.filter((producto) => {
    const matchesCategory = categoryFilter === 'all' || producto.categoriaId === categoryFilter
    const matchesQuery = producto.nombre.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <main className="admin">
      <div className="admin-title">
        <div>
          <p className="eyebrow">Panel de Sanddy</p>
          <h1>Tu inventario</h1>
          <p>Haz clic en una celda para editar. Los cambios se guardan al salir.</p>
        </div>
        <div className="admin-actions">
          <button className="secondary" onClick={() => setShowCategories(true)}>
            Categorías
          </button>
          <button className="secondary" onClick={() => setShowOrders(true)}>
            Historial de pedidos
          </button>
          <label className="secondary import">
            Importar CSV
            <input
              type="file"
              accept=".csv"
              onChange={(e) => readCsvFile(e, setCsvPreview, categorias)}
            />
          </label>
          <button className="secondary" onClick={() => exportCsv(productos, categorias)}>
            Exportar CSV
          </button>
          <button
            className="secondary"
            onClick={async () => {
              await logout()
              setSession('out')
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="admin-controls">
        <label className="search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre"
          />
        </label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      <p className="saved" aria-live="polite">
        {message === 'Guardado' ? '✓ Guardado' : message}
      </p>

      <div className="sheet-wrap">
        <table className="sheet">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Activo</th>
              <th>Imagen</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((producto) => (
              <SheetRow
                key={producto.id}
                product={producto}
                categorias={categorias}
                onSave={save}
                onEdit={() => setEditingProduct(producto)}
                onDelete={() => handleDelete(producto)}
              />
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7}>
                <button className="new-row" onClick={addBlankProduct}>
                  ＋ Escribe aquí para agregar un producto nuevo
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          categorias={categorias}
          onClose={() => setEditingProduct(null)}
          onSave={async (producto) => {
            await save(producto)
            setEditingProduct(null)
          }}
        />
      )}

      {showCategories && (
        <Categories
          categorias={categorias}
          productos={productos}
          onClose={() => setShowCategories(false)}
          onRefresh={refresh}
        />
      )}

      {csvPreview && (
        <CsvPreview
          list={csvPreview}
          existing={productos}
          onClose={() => setCsvPreview(null)}
          onConfirm={confirmCsvImport}
        />
      )}

      {showOrders && <Orders onClose={() => setShowOrders(false)} />}
    </main>
  )
}
