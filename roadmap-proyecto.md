# Roadmap del Proyecto — Sanddy Almacén

## Estado actual

- Entrevista al cliente y documento de contexto: completados.
- Plan de fases inicial (AWS + React/Vite): completado y luego revisado.
- Pila tecnológica: **congelada** (ver abajo).
- Repositorio base: existe un scaffold previo (`sanddy-almacen`, estructura de monorepo con `apps/web`) creado durante la Fase 1 original, sobre supuestos de AWS/React. Ese scaffold queda obsoleto respecto a la pila actual y debe decidirse si se reutiliza reestructurado o se arranca limpio (ver "Decisión pendiente" más abajo).
- Código de la aplicación: no iniciado. Este es el siguiente paso.

---

## Decisiones arquitectónicas congeladas

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind, App Router | SEO, OpenGraph para compartir productos, URLs amigables, preparado para crecer |
| Hosting | Azure Static Web Apps (free tier, SSR/hybrid habilitado) | Costo $0 estable, sin el riesgo de cierre de cuenta que tiene AWS Free Plan |
| Backend | Azure Functions (integradas a Static Web Apps) | Incluidas en el mismo free tier, sin costo adicional |
| Base de datos | Cosmos DB (free tier) | 1000 RU/s y 25 GB gratis de por vida de la suscripción |
| Imágenes | Blob Storage | Costo mínimo, solo para fotos de producto |
| Autenticación admin | Cookie de sesión firmada, un solo usuario, credenciales en variables de entorno | Sandra es la única administradora; evita construir un sistema de login completo que no se necesita |
| Carrito | `{id, qty}[]` codificado en la URL, precio y nombre resueltos en servidor al leer | URLs cortas, precio siempre actualizado, base lista para el QR futuro |
| Estado del carrito (cliente) | Zustand | Simple, sin boilerplate, suficiente para el alcance |
| Validaciones | Zod | Un solo esquema reutilizable entre formularios y funciones de backend |
| Formularios admin | React Hook Form | Reduce código repetido en los formularios de producto/categoría |
| Estilos utilitarios | clsx | Combinar clases de Tailwind de forma condicional |
| Iconos | lucide-react | Set de iconos liviano, consistente con Tailwind |

---

## Consideraciones específicas de Azure (verificadas antes de congelar la decisión)

- **El renderizado híbrido de Next.js (SSR/ISR) en Static Web Apps está en Preview**, no en disponibilidad general todavía. Microsoft confirma que no tiene costo adicional (corre sobre Azure Functions, dentro del free tier), pero hay que tener presente que:
  - No se pueden vincular Azure Functions externas por separado; solo se usan las integradas automáticamente por Static Web Apps.
  - El soporte de `staticwebapp.config.json` es parcial en modo híbrido.
  - La emulación local con el CLI de SWA no soporta todavía el modo híbrido completo (el desarrollo local se hace con `next dev` normal, sin problema).
- **Free tier de Static Web Apps**: tope de 100 GB de tráfico al mes. Si se supera, el sitio deja de responder pero **no se cobra de más** — hay que subir de plan manualmente si eso llegara a pasar. Con el volumen de Sandra esto es prácticamente imposible de alcanzar en el corto/mediano plazo.
- **Cosmos DB free tier**: es **una sola cuenta gratuita por suscripción de Azure**. Hay que marcar explícitamente la opción de "free tier discount" al crear la cuenta de Cosmos DB, si no se activa por defecto se empieza a cobrar desde el primer uso.
- **Blob Storage**: no tiene un nivel "siempre gratis" tan generoso como el resto de los servicios. El costo esperado es mínimo dado el tamaño del catálogo, pero conviene comprimir imágenes antes de subirlas y definir un límite razonable de peso por foto para mantenerlo cerca de $0.
- **Azure Functions**: 1.000.000 de ejecuciones al mes y 400.000 GB-s de cómputo, siempre gratis, sin límite de tiempo de la cuenta.
- **Dominio propio**: Static Web Apps free tier permite conectar un dominio propio con certificado SSL gratuito, sin costo adicional.
- **CI/CD**: al conectar el repositorio de GitHub con Static Web Apps, Azure genera automáticamente el workflow de GitHub Actions para build y despliegue. No hace falta escribirlo a mano desde cero, aunque sí conviene revisarlo y agregarle los pasos de lint/test antes del deploy.
- **Región**: elegir la región de Azure más cercana a los clientes reales de Sandra al crear los recursos, ya que afecta la latencia y en algunos casos la disponibilidad del free tier de Cosmos DB.

---

## Decisión pendiente antes del scaffold

Existe un repositorio ya inicializado (`sanddy-almacen`) con estructura de monorepo, pensado originalmente para AWS + React/Vite. La nueva estructura propuesta (`Ecommerce-solution-platform`) es un proyecto Next.js plano, sin monorepo. Hay que elegir una de estas dos opciones antes de ejecutar `create-next-app`:

1. **Reestructurar el repo existente**: mantener el historial de commits y la documentación ya subida (entrevista, contexto, planes anteriores), pero reemplazar `apps/web` y `src/*` por la estructura de Next.js plano.
2. **Arrancar un repositorio nuevo** (`Ecommerce-solution-platform`) y mover manualmente solo la carpeta `docs/` con la documentación ya generada.

Cualquiera de las dos es válida; lo importante es no dejar ambos repos activos en paralelo.

---

## Estructura objetivo del proyecto

```
Ecommerce-solution-platform/
├── docs/
│
├── src/
│   ├── app/
│   │   ├── (catalog)/
│   │   ├── admin/
│   │   ├── login/
│   │   └── api/
│   │
│   ├── components/
│   │
│   ├── features/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── inventory/
│   │   ├── cart/
│   │   └── auth/
│   │
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── services/
│   └── utils/
│
├── public/
├── tests/
│
├── .env.local.example
├── README.md
└── package.json
```

---

## Comando de scaffold

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app
```

Al preguntar por Turbopack: responder que sí.
Al preguntar por personalizar el alias de importación: responder que no (se usa el alias por defecto `@/*`).

### Nota de reconciliación con Fase 1

El scaffold de `create-next-app` trae su propia configuración de ESLint (`eslint-config-next`). Si se reutiliza el repo existente (opción 1 de la decisión pendiente), hay que revisar que no choque con la configuración de ESLint/Prettier/Husky ya definida en la Fase 1 original, y quedarse con una sola fuente de verdad para lint y formato.

---

## Dependencias iniciales a instalar tras el scaffold

```bash
npm install zod
npm install zustand
npm install react-hook-form
npm install clsx
npm install lucide-react
```

| Librería | Uso |
|---|---|
| zod | Validaciones de formularios y datos |
| react-hook-form | Formularios del panel admin |
| zustand | Estado del carrito |
| clsx | Combinar clases de Tailwind condicionalmente |
| lucide-react | Iconografía |

---

## Primer commit real

```bash
git add .
git commit -m "chore: initialize nextjs application"
git push origin main
```

---

## Roadmap por sprints

### Sprint 1 — Infraestructura de frontend
- [ ] Layout público
- [ ] Layout admin
- [ ] Sistema de rutas
- [ ] Tailwind base (tokens de color, tipografía)
- [ ] Tipos de dominio (`Product`, `Category`, `CartItem`)
- [ ] Datos de prueba (mock data)
- [ ] Navbar
- [ ] Footer
- [ ] Sidebar admin

### Sprint 2 — Modelo de negocio
- [ ] Categorías (lógica de dominio, sin UI final todavía)
- [ ] Productos (lógica de dominio)
- [ ] Carrito (estado con Zustand)
- [ ] Codificación/decodificación de la URL compartible

### Sprint 3 — Panel administrativo
- [ ] Login con cookie de sesión
- [ ] CRUD Categorías
- [ ] CRUD Productos
- [ ] Vista de inventario

### Sprint 4 — Catálogo público
- [ ] Home
- [ ] Búsqueda
- [ ] Filtros por categoría
- [ ] Detalle de producto (con metadatos OpenGraph)
- [ ] Compartir por WhatsApp (link + botón)

### Sprint 5 — Conexión a Azure y cierre (no estaba en la propuesta original, se agrega para no dejar el proyecto sin desplegar)
- [ ] Conectar el repositorio a Azure Static Web Apps
- [ ] Configurar Cosmos DB (con free tier activado) y reemplazar los datos de prueba
- [ ] Configurar Blob Storage para imágenes reales
- [ ] Revisar y ajustar el workflow de GitHub Actions generado por Azure
- [ ] Pruebas básicas (unitarias e integración) sobre carrito, CRUD y generación de link
- [ ] Documentación final en el README (instalación, variables de entorno, arquitectura, despliegue)

---

## Próximo paso técnico

Ejecutar `create-next-app` dentro de la carpeta definida (según la decisión pendiente de estructura del repo), y subir el primer commit real. A partir de ahí se trabaja directamente sobre el Sprint 1.
