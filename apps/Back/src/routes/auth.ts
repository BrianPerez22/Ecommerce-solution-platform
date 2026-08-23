import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../prisma.js'
import { verifyPassword } from '../utils/password.js'
import { HttpError } from '../utils/httpError.js'
import { SESSION_COOKIE_NAME } from '../plugins/jwt.js'

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60 // 8 horas, igual que `sign: { expiresIn: '8h' }` en jwt.ts

type LoginBody = { username: string; password: string }

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: LoginBody }>('/auth/login', async (request, reply) => {
    const { username, password } = request.body
    const usuario = await prisma.usuario.findUnique({ where: { username } })

    // Mismo mensaje tanto si el usuario no existe como si la contraseña es incorrecta,
    // para no revelar si un username en particular está registrado.
    const valido = usuario && (await verifyPassword(password, usuario.passwordHash))
    if (!valido || !usuario) {
      throw new HttpError(401, 'Usuario o contraseña incorrectos.')
    }

    const token = app.jwt.sign({ sub: usuario.id, username: usuario.username })
    reply.setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // TODO: true cuando el backend corra detrás de HTTPS en producción
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return { username: usuario.username }
  })

  app.post('/auth/logout', async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' })
    return reply.code(204).send()
  })

  app.get('/auth/me', { onRequest: [app.requireAuth] }, async (request) => {
    return { username: request.user.username }
  })
}
