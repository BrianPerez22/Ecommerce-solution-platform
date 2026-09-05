import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import { env } from '../env.js'

/**
 * Sirve el build del front desde el mismo servidor que la API (despliegue monolito).
 *
 * Ir por un solo origen no es solo comodidad de despliegue: la cookie de sesión es
 * `SameSite=Lax`, así que si el front viviera en otro dominio el navegador no la
 * enviaría y el panel de admin no podría iniciar sesión.
 *
 * En desarrollo la carpeta no existe (el front lo sirve Vite en su propio puerto), y en
 * ese caso esto no registra nada: el servidor arranca igual, solo con la API.
 */
export async function registerStatic(app: FastifyInstance) {
  const root = path.resolve(process.cwd(), env.frontendDist)

  if (!existsSync(path.join(root, 'index.html'))) {
    app.log.info(`Sin build del front en ${root}: se sirve solo la API.`)
    return
  }

  await app.register(fastifyStatic, {
    root,
    // Sin comodín: @fastify/static registra una ruta por cada archivo real del build y
    // todo lo demás cae en el notFound de abajo. Eso es lo que hace que funcionen las
    // rutas del SPA como /admin, que no corresponden a ningún archivo en disco.
    wildcard: false,
  })

  // Se lee una sola vez: el build es inmutable mientras el proceso viva.
  const indexHtml = await readFile(path.join(root, 'index.html'))

  app.setNotFoundHandler((request, reply) => {
    const ruta = request.url.split('?')[0]
    // Un archivo que se pidió por su nombre y no está es un 404 de verdad, no una ruta
    // del SPA: devolverle el index.html haría que el navegador intentara ejecutar HTML
    // como si fuera JavaScript y el error no se parecería en nada a la causa.
    const pareceArchivo = ruta.slice(ruta.lastIndexOf('/')).includes('.')

    // La API responde JSON incluso cuando no encuentra algo. Devolverle el index.html a
    // un fetch haría que `store.ts` intentara parsear HTML como JSON.
    if (request.method !== 'GET' || ruta.startsWith('/api') || pareceArchivo) {
      return reply.code(404).send({ message: 'Recurso no encontrado.' })
    }
    return reply.type('text/html').send(indexHtml)
  })
}
