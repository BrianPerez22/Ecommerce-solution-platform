# Sanddy Almacen

🌐 **Sitio en produccion: [https://sanddy-almacen.onrender.com/](https://sanddy-almacen.onrender.com/)**

Plataforma de catalogo e inventario para Sanddy Almacen. Permite al administrador gestionar productos y categorias mediante un panel tipo hoja de calculo, y permite a los clientes explorar el inventario publico y armar un carrito de interes que se convierte en un codigo QR, sin pasarela de pago.

Proyecto final de la asignatura **Tendencias Tecnologicas** — Universidad EAN.

## Enlaces del proyecto

| Enlace | Que es |
| ------ | ------ |
| [Catalogo publico](https://sanddy-almacen.onrender.com/) | La tienda, sin login: navegar productos y armar la lista de interes |
| [Panel de administracion](https://sanddy-almacen.onrender.com/admin) | Gestion de inventario, categorias y pedidos (requiere usuario y contrasena) |
| [Estado del servicio](https://sanddy-almacen.onrender.com/api/health) | Responde `{"status":"ok"}` si la aplicacion y la base de datos estan arriba |

> ⏱️ El servicio corre en el plan gratuito de Render: se apaga tras 15 minutos sin visitas y la primera peticion despues de ese lapso tarda cerca de un minuto en responder. No esta caido, esta despertando.

## Equipo

| Integrante | Rol | Responsabilidad |
| ---------- | --- | --------------- |
| **Sergio Alejandro Rey Mateus** | Documentacion · Cliente · Problema | Entrevista y relacion con la clienta, definicion del problema, Lean UX Canvas, mapa de empatia, encuesta de validacion, stakeholders y objetivos SMART |
| **Brian David Pérez Herrera** | Desarrollador · Nube | Estructura inicial del monorepo y tooling, plan de fases, roadmap tecnico, abstraccion de almacenamiento y migracion a la nube |
| **Stiven Daniel Melo Guayazán** | Desarrollador · Despliegue | Frontend y backend (`apps/Front`, `apps/Back`), modelo de datos y migraciones, autenticacion, imagen Docker y publicacion |

📓 **[Diario de Trabajo del equipo](./docs/planificacion/diario-de-trabajo.md)** — bitacora del proyecto con las entradas diarias, el reparto de responsabilidades individuales y grupales, la trazabilidad completa de commits y ramas, y la reflexion critica de cada fase (Definir → Idear → Validar).

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

La documentacion funcional y tecnica del proyecto se encuentra en la carpeta [`docs/`](./docs), organizada en `docs/apps` (guías técnicas de Front/Back), `docs/investigacion` (entrevistas, contexto, UX) y `docs/planificacion` (roadmap y fases de desarrollo).

| Documento | Contenido |
| --------- | --------- |
| [Diario de Trabajo](./docs/planificacion/diario-de-trabajo.md) | Bitacora del equipo: entradas diarias, responsabilidades de cada integrante, trazabilidad de commits y reflexion critica |
| [Objetivos SMART](./docs/planificacion/objetivos-smart.md) | Problema, causas y efectos, requerimientos, objetivo general y objetivos especificos |
| [Como funciona](./docs/apps/como-funciona.md) | Explicacion tecnica en lenguaje sencillo de cada pieza del sistema |
| [Como correr](./docs/apps/como-correr.md) | Guia paso a paso para levantar el proyecto en local |
| [Despliegue](./docs/apps/despliegue.md) | Publicacion del monolito en Render con la base de datos en Neon |
