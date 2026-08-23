import { useState, type FormEvent } from 'react'
import { deleteCategoria, saveCategoria } from '../services/store'
import type { Categoria, Producto } from '../models/seed'
import { generateId, slugify } from '../utils/format'

/** Ventana para crear, renombrar, reordenar y eliminar categorías del catálogo. */
export function Categories({
  categorias,
  productos,
  onClose,
  onRefresh,
}: {
  categorias: Categoria[]
  productos: Producto[]
  onClose: () => void
  onRefresh: () => Promise<void>
}) {
  const [newName, setNewName] = useState('')
  const [message, setMessage] = useState('')

  function productCount(categoriaId: string) {
    return productos.filter((p) => p.categoriaId === categoriaId).length
  }

  async function move(categoria: Categoria, direction: -1 | 1) {
    const index = categorias.indexOf(categoria)
    const swapWith = categorias[index + direction]
    if (!swapWith) return

    // Intercambia el campo "orden" entre las dos categorías para moverlas en la lista.
    await saveCategoria({ ...categoria, orden: swapWith.orden })
    await saveCategoria({ ...swapWith, orden: categoria.orden })
    await onRefresh()
  }

  async function rename(categoria: Categoria, nombre: string) {
    await saveCategoria({ ...categoria, nombre, slug: slugify(nombre) })
    await onRefresh()
  }

  async function remove(categoria: Categoria) {
    try {
      await deleteCategoria(categoria.id)
      await onRefresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    await saveCategoria({
      id: slugify(newName) + '-' + generateId(),
      nombre: newName.trim(),
      slug: slugify(newName),
      orden: categorias.length + 1,
    })
    setNewName('')
    await onRefresh()
  }

  return (
    <div className="modal-backdrop">
      <section className="categories" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Categorías</h2>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <p>Organiza el orden en que aparecen en el catálogo.</p>

        <div className="category-list">
          {categorias.map((categoria) => (
            <div key={categoria.id}>
              <span className="drag">↕</span>
              <input value={categoria.nombre} onChange={(e) => rename(categoria, e.target.value)} />
              <small>{productCount(categoria.id)} productos</small>
              <button onClick={() => move(categoria, -1)}>↑</button>
              <button onClick={() => move(categoria, 1)}>↓</button>
              <button className="icon-button" onClick={() => remove(categoria)}>
                ×
              </button>
            </div>
          ))}
        </div>

        <form className="new-category" onSubmit={addCategory}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nueva categoría"
          />
          <button className="secondary">Agregar</button>
        </form>

        {message && <p className="notice">{message}</p>}
      </section>
    </div>
  )
}
