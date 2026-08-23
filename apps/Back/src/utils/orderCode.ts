import type { PrismaClient } from '@prisma/client'

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CODE_LENGTH = 4
const MAX_ATTEMPTS = 5

function randomCode(): string {
  let suffix = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return `SA-${suffix}`
}

/** Genera un código de pedido único, reintentando si choca con uno ya existente. */
export async function createUniqueOrderCode(prisma: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const codigo = randomCode()
    const existing = await prisma.pedido.findUnique({ where: { codigo } })
    if (!existing) return codigo
  }
  throw new Error('No se pudo generar un código de pedido único, intenta de nuevo.')
}
