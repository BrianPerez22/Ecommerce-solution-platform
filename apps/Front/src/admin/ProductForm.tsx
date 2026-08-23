import { useState, type ChangeEvent } from 'react'
import type { Categoria, Producto } from '../models/seed'
import { uploadImagen } from '../services/store'
import { compactImageToBlob } from './image'

/** Formulario completo para crear o editar un producto, incluyendo sus imágenes. */
export function ProductForm({
  product,
  categorias,
  onClose,
  onSave,
}: {
  product: Producto
  categorias: Categoria[]
  onClose: () => void
  onSave: (p: Producto) => void
}) {
  const [draft, setDraft] = useState(product)
  const [featuresText, setFeaturesText] = useState(product.caracteristicas.join('\n'))

  function setField(key: keyof Producto, value: string | boolean | string[]) {
    setDraft({ ...draft, [key]: value })
  }

  function setNumberField(key: 'precio' | 'stock', raw: string) {
    setDraft({ ...draft, [key]: Math.max(0, Number(raw) || 0) })
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const blob = await compactImageToBlob(file)
      const url = await uploadImagen(blob)
      setField('imagenes', [...draft.imagenes, url])
    } catch {
      alert('No pudimos subir esa imagen. Prueba una imagen más pequeña.')
    }
  }

  function handleSave() {
    const caracteristicas = featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    onSave({ ...draft, caracteristicas })
  }

  return (
    <div className="modal-backdrop">
      <section className="form-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{product.nombre || 'Nuevo producto'}</h2>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-grid">
          <label className="field full">
            <span>Nombre</span>
            <input
              autoFocus
              value={draft.nombre}
              onChange={(e) => setField('nombre', e.target.value)}
              placeholder="Ej. Crema hidratante"
            />
          </label>

          <label className="field">
            <span>Categoría</span>
            <select
              value={draft.categoriaId}
              onChange={(e) => setField('categoriaId', e.target.value)}
            >
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Precio</span>
            <input
              inputMode="numeric"
              value={draft.precio}
              onChange={(e) => setNumberField('precio', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Stock</span>
            <input
              inputMode="numeric"
              value={draft.stock}
              onChange={(e) => setNumberField('stock', e.target.value)}
            />
          </label>

          <label className="field check">
            <input
              type="checkbox"
              checked={draft.activo}
              onChange={(e) => setField('activo', e.target.checked)}
            />{' '}
            Publicar en el catálogo
          </label>

          <label className="field full">
            <span>Descripción</span>
            <textarea
              value={draft.descripcion}
              onChange={(e) => setField('descripcion', e.target.value)}
              rows={3}
            />
          </label>

          <label className="field full">
            <span>
              Características <em>(una por línea)</em>
            </span>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={4}
            />
          </label>

          <label className="field full">
            <span>URL de imagen</span>
            <input
              value={draft.imagenes[0] || ''}
              onChange={(e) => setField('imagenes', [e.target.value, ...draft.imagenes.slice(1)])}
            />
          </label>

          <div className="image-manager full">
            {draft.imagenes.map((src, index) => (
              <div key={src + index}>
                <img src={src} alt="" />
                <button
                  onClick={() =>
                    setField(
                      'imagenes',
                      draft.imagenes.filter((_, j) => j !== index),
                    )
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
            <label className="upload">
              Subir una imagen
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <div className="form-footer">
          <button className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" onClick={handleSave}>
            Guardar cambios
          </button>
        </div>
      </section>
    </div>
  )
}
