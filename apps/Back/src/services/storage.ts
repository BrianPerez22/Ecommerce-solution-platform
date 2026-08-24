import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { Readable } from 'node:stream'
import { BlobServiceClient, type ContainerClient } from '@azure/storage-blob'
import { env } from '../env.js'

export interface UploadableFile {
  filename: string
  mimetype: string
  stream: Readable
}

let containerClientPromise: Promise<ContainerClient> | null = null

/** Cliente del contenedor de Blob Storage, creado una sola vez y reutilizado entre subidas. */
function getContainerClient(): Promise<ContainerClient> {
  if (!containerClientPromise) {
    containerClientPromise = (async () => {
      const service = BlobServiceClient.fromConnectionString(env.azureStorageConnectionString!)
      const container = service.getContainerClient(env.azureStorageContainer)
      // Idempotente: si el contenedor ya existe (caso normal en producción), no hace nada.
      // access: 'blob' = cada blob es públicamente legible por URL directa, el contenedor no es listable.
      await container.createIfNotExists({ access: 'blob' })
      return container
    })()
  }
  return containerClientPromise
}

/**
 * Guarda un archivo subido según STORAGE_DRIVER y devuelve la URL con la que
 * el frontend debe mostrarlo:
 * - 'local': ruta relativa servida por @fastify/static, ej. `/uploads/xxx.jpg`
 * - 'azure': URL pública y absoluta del blob, ej. `https://<cuenta>.blob.core.windows.net/productos/xxx.jpg`
 *
 * El resto de la app (rutas, frontend) nunca debería preguntar cuál driver está activo:
 * solo debe usar la URL devuelta tal cual.
 */
export async function saveUpload(file: UploadableFile): Promise<string> {
  const extension = path.extname(file.filename) || '.jpg'
  const fileName = `${randomUUID()}${extension}`

  if (env.storageDriver === 'azure') {
    const container = await getContainerClient()
    const blob = container.getBlockBlobClient(fileName)
    await blob.uploadStream(file.stream, undefined, undefined, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    })
    return blob.url
  }

  const destination = path.resolve(process.cwd(), env.uploadsDir, fileName)
  await pipeline(file.stream, createWriteStream(destination))
  return `/uploads/${fileName}`
}
