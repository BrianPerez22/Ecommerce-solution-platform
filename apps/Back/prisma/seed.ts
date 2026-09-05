import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

type CategoriaSeed = { id: string; nombre: string; slug: string; orden: number }
type ProductoSeed = {
  id: string
  nombre: string
  descripcion: string
  caracteristicas: string[]
  precio: number
  stock: number
  categoriaId: string
  imagenes: string[]
  activo: boolean
}

const categorias: CategoriaSeed[] = [
  { id: 'belleza', nombre: 'Belleza', slug: 'belleza', orden: 1 },
  { id: 'cabello', nombre: 'Cuidado del cabello', slug: 'cabello', orden: 2 },
  { id: 'hogar', nombre: 'Electrodomésticos', slug: 'hogar', orden: 3 },
]

// El seed usa imágenes externas de Unsplash a propósito: no obliga a meter binarios en
// el repo y ejercita el caso mixto — `Producto.imagenes` admite tanto `/imagenes/<id>`
// (bytes en la base) como URLs externas. Las propias solo entran por `POST /imagenes`.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

const productos: ProductoSeed[] = [
  {
    id: 'p1',
    nombre: 'Base líquida Velvet',
    descripcion: 'Cobertura modulable con acabado natural para todos los días.',
    caracteristicas: ['Tono medio cálido', '30 ml', 'Larga duración'],
    precio: 45900,
    stock: 8,
    categoriaId: 'belleza',
    imagenes: [img('photo-1596462502278-27bfdc403348')],
    activo: true,
  },
  {
    id: 'p2',
    nombre: 'Rubor compacto Rosé',
    descripcion: 'Color suave y luminoso que se difumina fácilmente.',
    caracteristicas: ['Tono rosado', 'Espejo incluido', 'Vegano'],
    precio: 28900,
    stock: 3,
    categoriaId: 'belleza',
    imagenes: [img('photo-1512496015851-a90fb38ba796')],
    activo: true,
  },
  {
    id: 'p3',
    nombre: 'Labial mate Cereza',
    descripcion: 'Labial intenso, cómodo y de color profundo.',
    caracteristicas: ['Rojo cereza', 'No reseca', '4 g'],
    precio: 22900,
    stock: 0,
    categoriaId: 'belleza',
    imagenes: [img('photo-1586495777744-4413f21062fa')],
    activo: true,
  },
  {
    id: 'p4',
    nombre: 'Kit de brochas esencial',
    descripcion: 'Las seis herramientas básicas para un maquillaje completo.',
    caracteristicas: ['6 piezas', 'Cerdas suaves', 'Estuche incluido'],
    precio: 54900,
    stock: 5,
    categoriaId: 'belleza',
    imagenes: [img('photo-1522335789203-aabd1fc54bc9')],
    activo: true,
  },
  {
    id: 'p5',
    nombre: 'Shampoo reparador',
    descripcion: 'Limpia suavemente y ayuda a recuperar el brillo.',
    caracteristicas: ['Sin sal', '400 ml', 'Para cabello dañado'],
    precio: 32900,
    stock: 12,
    categoriaId: 'cabello',
    imagenes: [img('photo-1527799820374-dcf8d9d4a388')],
    activo: true,
  },
  {
    id: 'p6',
    nombre: 'Mascarilla de keratina',
    descripcion: 'Tratamiento nutritivo para usar una o dos veces por semana.',
    caracteristicas: ['500 g', 'Con keratina', 'Uso semanal'],
    precio: 38900,
    stock: 4,
    categoriaId: 'cabello',
    imagenes: [img('photo-1608248597279-f99d160bfcbc')],
    activo: true,
  },
  {
    id: 'p7',
    nombre: 'Sérum anti-frizz',
    descripcion: 'Gotas ligeras para puntas suaves y definidas.',
    caracteristicas: ['60 ml', 'Control de frizz', 'Termoprotector'],
    precio: 41900,
    stock: 2,
    categoriaId: 'cabello',
    imagenes: [img('photo-1626015365107-6f3e56e37e8a')],
    activo: true,
  },
  {
    id: 'p8',
    nombre: 'Cepillo térmico ovalado',
    descripcion: 'Seca y peina al mismo tiempo para una melena con volumen.',
    caracteristicas: ['2 niveles de calor', 'Cable giratorio', '110 V'],
    precio: 119900,
    stock: 3,
    categoriaId: 'cabello',
    imagenes: [img('photo-1522338140502-f6f9e38244b7')],
    activo: true,
  },
  {
    id: 'p9',
    nombre: 'Licuadora personal Mint',
    descripcion: 'Ideal para jugos, batidos y porciones individuales.',
    caracteristicas: ['Vaso de 600 ml', '2 velocidades', 'Vaso portátil'],
    precio: 109900,
    stock: 6,
    categoriaId: 'hogar',
    imagenes: [img('photo-1570222094114-d054a817e56b')],
    activo: true,
  },
  {
    id: 'p10',
    nombre: 'Freidora de aire 4 L',
    descripcion: 'Prepara tus recetas favoritas con menos aceite.',
    caracteristicas: ['4 litros', 'Temporizador', 'Canasta antiadherente'],
    precio: 249900,
    stock: 2,
    categoriaId: 'hogar',
    imagenes: [img('photo-1648115528088-1988f465d0ca')],
    activo: true,
  },
  {
    id: 'p11',
    nombre: 'Plancha de vapor compacta',
    descripcion: 'Práctica para cuidar tus prendas sin ocupar mucho espacio.',
    caracteristicas: ['Cerámica', 'Golpe de vapor', '1200 W'],
    precio: 89900,
    stock: 7,
    categoriaId: 'hogar',
    imagenes: [img('photo-1584990347449-a8a42c6d4a65')],
    activo: true,
  },
  {
    id: 'p12',
    nombre: 'Hervidor eléctrico lila',
    descripcion: 'Agua caliente en minutos para café, té o aromática.',
    caracteristicas: ['1.7 litros', 'Apagado automático', 'Base giratoria'],
    precio: 79900,
    stock: 0,
    categoriaId: 'hogar',
    imagenes: [img('photo-1594213114663-d94db9b17125')],
    activo: false,
  },
]

async function main() {
  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { id: categoria.id },
      create: categoria,
      update: categoria,
    })
  }

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { id: producto.id },
      create: producto,
      update: producto,
    })
  }

  const yaHayPedidos = (await prisma.pedido.count()) > 0
  if (!yaHayPedidos) {
    await prisma.pedido.create({
      data: {
        codigo: 'SA-DEMO',
        clienteNombre: 'Cliente de ejemplo',
        total: 45900 + 2 * 28900,
        lineas: {
          create: [
            { productoId: 'p1', productoNombre: 'Base líquida Velvet', cantidad: 1, precioUnitario: 45900 },
            { productoId: 'p2', productoNombre: 'Rubor compacto Rosé', cantidad: 2, precioUnitario: 28900 },
          ],
        },
      },
    })
  }

  const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'sanddy'
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'sanddy2026'
  const adminExistente = await prisma.usuario.findUnique({ where: { username: adminUsername } })
  if (!adminExistente) {
    const passwordHash = await hashPassword(adminPassword)
    await prisma.usuario.create({ data: { username: adminUsername, passwordHash } })
    console.log(`Usuario admin '${adminUsername}' creado.`)
  } else {
    console.log(`Usuario admin '${adminUsername}' ya existe, no se modifica su contraseña.`)
  }

  console.log(`Sembrados: ${categorias.length} categorías, ${productos.length} productos.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
