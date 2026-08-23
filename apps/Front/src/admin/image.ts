const MAX_WIDTH_PX = 800
const JPEG_QUALITY = 0.76

/**
 * Reduce el tamaño de una imagen subida por el usuario y la devuelve como un Blob JPEG,
 * listo para subir al backend, para no llenar el servidor con fotos pesadas.
 */
export function compactImageToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      image.onload = () => {
        const scale = Math.min(1, MAX_WIDTH_PX / image.width)
        const canvas = document.createElement('canvas')
        canvas.width = image.width * scale
        canvas.height = image.height * scale

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('No se pudo preparar el lienzo de la imagen'))
          return
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
          'image/jpeg',
          JPEG_QUALITY,
        )
      }
      image.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
