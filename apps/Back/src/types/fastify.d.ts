import type { FastifyReply, FastifyRequest } from 'fastify'

type SessionPayload = { sub: string; username: string }

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: SessionPayload
    user: SessionPayload
  }
}
