# Sanddy Almacen

Plataforma de catalogo e inventario para Sanddy Almacen. Permite al administrador gestionar productos y categorias mediante un panel tipo hoja de calculo, y permite a los clientes explorar el inventario publico y armar un carrito de interes que se convierte en un codigo QR, sin pasarela de pago.

## Estructura del proyecto

```
sanddy-almacen/
├── apps/
│   └── web/            # Aplicacion web (admin + catalogo publico)
├── src/
│   ├── admin/           # Modulo de administracion de productos e inventario
│   ├── catalog/         # Modulo de catalogo publico para clientes
│   ├── components/      # Componentes UI compartidos
│   ├── services/        # Integraciones (AWS, API, etc.)
│   ├── hooks/            # Hooks reutilizables
│   ├── models/           # Modelos y esquemas de datos
│   ├── utils/            # Utilidades generales
│   └── types/            # Tipos compartidos de TypeScript
├── public/               # Archivos estaticos
├── docs/                 # Documentacion del proyecto
├── tests/                # Pruebas
├── package.json
├── tsconfig.json
└── README.md
```

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior

## Instalacion

```bash
npm install
```

## Scripts disponibles

| Script                 | Descripcion                                   |
| ---------------------- | --------------------------------------------- |
| `npm run lint`         | Revisa el codigo con ESLint                   |
| `npm run lint:fix`     | Corrige automaticamente lo que se pueda       |
| `npm run format`       | Formatea el codigo con Prettier               |
| `npm run format:check` | Verifica el formato sin modificar archivos    |
| `npm run typecheck`    | Verifica los tipos de TypeScript sin compilar |

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores correspondientes.

```bash
cp .env.example .env
```

## Documentacion

La documentacion funcional y tecnica del proyecto se encuentra en la carpeta `docs/`.
