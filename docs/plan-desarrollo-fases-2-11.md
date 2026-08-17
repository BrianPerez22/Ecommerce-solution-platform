# Plan de Desarrollo — Sanddy Almacén (Fases 2 a 11)

> Continuación de la Fase 1 (ya completada: monorepo, TypeScript, ESLint, Prettier, Husky, estructura de carpetas).
> Este documento corrige, completa y ordena el plan original para que sea ejecutable sin ambigüedades.

## Cambios y mejoras aplicadas sobre el plan original

- Se corrigió "conectar con Azure" por **AWS**, consistente con el resto del proyecto.
- Se dejó explícito que el MVP usa **generador de WhatsApp** en vez de QR (el QR pasa a Prioridad 3). Es un cambio de alcance respecto a la idea inicial del carrito-QR; se mantiene documentado para que sea una decisión tomada con conocimiento, no un olvido.
- Se agregó **Fase 4.0 — Autenticación del admin**, que estaba mencionada en el backlog pero no tenía fase propia.
- Se completaron los modelos de datos (`Category`, `Product`, `CartItem`, `InterestCart`) con todos los campos necesarios para trabajar contra DynamoDB y S3.
- Se agregó **Fase 11 — CI/CD y despliegue en AWS**, ausente en el plan original, necesaria para que "listo para conectar con AWS" sea real y no solo una frase.
- Se agregaron herramientas concretas (no solo checklists) para testing, tabla editable, importación/exportación y manejo de imágenes.

---

## Fase 2. Modelo de datos

### Objetivo
Definir las entidades del negocio de forma completa, pensadas para DynamoDB (clave-valor, sin joins) y S3 (imágenes).

### Category

```typescript
export interface Category {
  id: string;            // UUID
  name: string;
  slug: string;           // usado en rutas /products?category=slug
  order: number;          // orden de visualización
  active: boolean;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
}
```

### Product

```typescript
export interface Product {
  id: string;              // UUID
  name: string;
  description: string;
  categoryId: string;      // referencia a Category.id
  price: number;           // en la moneda local, sin decimales de formato (guardar como entero si aplica)
  stock: number;
  imageKey: string;        // key del objeto en S3, no la URL directa
  imageUrl: string;        // URL publica (CloudFront) derivada de imageKey, calculada al leer
  available: boolean;      // visible/oculto en el catalogo publico
  featured: boolean;       // aparece en destacados del home
  features?: string[];     // caracteristicas puntuales (bullet points)
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

### CartItem

```typescript
export interface CartItem {
  productId: string;
  name: string;            // se guarda copia del nombre por si el producto cambia despues
  price: number;           // precio al momento de agregarlo
  quantity: number;
}
```

### InterestCart

```typescript
export interface InterestCart {
  id: string;               // UUID, se usa para trazabilidad si mas adelante se persiste
  items: CartItem[];
  totalEstimated: number;   // suma de price * quantity, solo referencial
  createdAt: string;        // ISO 8601
}
```

### Notas de diseño de datos

- No se usa `undefined` para campos opcionales sin valor; se usa `null` o se omite la clave, según convenga al modelo de DynamoDB.
- `price` y `stock` deben validarse siempre como número, nunca string, antes de guardar (ver Fase 8).
- El `imageKey` se guarda en la base de datos y la `imageUrl` pública se resuelve en tiempo de lectura contra el dominio de CloudFront, para poder cambiar de CDN sin migrar datos.

---

## Fase 3. Componentes base

### Objetivo
Construir la librería de UI reutilizable, compartida entre el panel admin y el catálogo público.

### Layout
- Header
- Sidebar (solo admin)
- Footer
- Container
- Breadcrumbs

### Formularios
- Input
- Textarea
- Select
- Checkbox
- Button
- ImageUploader (con preview y subida directa a S3 vía URL prefirmada)

### Feedback
- Loader
- Toast
- EmptyState
- ConfirmDialog
- ErrorBoundary (captura errores de renderizado sin romper toda la app)

### Catálogo
- ProductCard
- ProductGrid
- CategoryFilter
- SearchBar
- CartSummary
- Pagination

---

## Fase 4.0. Autenticación del admin (nueva fase, faltaba en el plan original)

### Objetivo
Proteger el panel administrativo sin sobre-construir un sistema de usuarios que Sandra no necesita.

### Alcance para el MVP
- Autenticación **simulada** con un solo usuario administrador (Sandra), usuario y contraseña guardados como variable de entorno, sin registro de nuevos usuarios.
- Sesión manejada con JWT simple almacenado en cookie httpOnly.
- Todas las rutas bajo `/admin/*` verifican la sesión antes de renderizar.

### Pantallas
```
/admin/login
```

### Fuera de alcance en el MVP
- Múltiples administradores (queda en Prioridad 3 del backlog).
- Recuperación de contraseña por correo (se resuelve manualmente si se pierde).

---

## Fase 4. Panel Administrativo

### Módulo Categorías

**Funcionalidades**
- Crear categoría
- Editar categoría
- Eliminar categoría (con validación: no eliminar si tiene productos asociados, o reasignarlos)
- Activar/desactivar
- Ordenar categorías (drag and drop simple)

**Pantallas**
```
/admin/categories
/admin/categories/new
/admin/categories/edit/:id
```

### Módulo Productos

**Funcionalidades**
- Crear producto
- Editar producto
- Eliminar producto (confirmación obligatoria)
- Cambiar stock
- Cambiar precio
- Subir imagen (con compresión en el navegador antes de subir, para ahorrar espacio en S3)
- Marcar disponible/no disponible
- Marcar/desmarcar como destacado

**Pantallas**
```
/admin/products
/admin/products/new
/admin/products/edit/:id
```

### Vista tipo Excel

**Funcionalidades**
- Tabla editable en línea (edición directa de celdas)
- Edición rápida de nombre, precio, stock, categoría y estado
- Guardado inmediato (autosave por fila, con indicador de "guardado")
- Filtro por categoría y por estado
- Búsqueda por nombre
- Ordenamiento por columna
- Importación desde CSV/Excel
- Exportación a CSV/Excel

**Campos editables en la tabla**
```
nombre
precio
stock
categoría
estado (disponible / no disponible)
```

**Herramientas sugeridas**
- Tabla: `@tanstack/react-table` para orden, filtro y edición de celdas.
- Importar/exportar: `papaparse` para CSV y `xlsx` (SheetJS) para Excel.

---

## Fase 5. Catálogo Público

### Home
- Banner principal
- Categorías
- Productos destacados

### Listado
- Grid responsive (mobile-first, ya que la mayoría llega desde WhatsApp)
- Búsqueda
- Filtro por categoría
- Paginación simple

### Detalle
- Imagen
- Nombre
- Precio
- Características
- Disponibilidad (mostrar claramente "Sin stock" si `available` es falso o `stock` es 0)

### Rutas
```
/
/products
/products/:id
```

---

## Fase 6. Carrito de interés

### Objetivo
Permitir al cliente seleccionar productos sin proceso de compra ni pago real.

### Funcionalidades
- Agregar producto
- Quitar producto
- Cambiar cantidad
- Vaciar carrito
- Persistencia local (en el navegador del cliente, no en base de datos, ya que no hay cuentas de usuario)

### Modelo

```typescript
interface CartProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
```

---

## Fase 7. Generador de WhatsApp (reemplaza al QR en el MVP)

### Objetivo
Convertir el carrito de interés en un mensaje de WhatsApp listo para enviar a Sandra, sin pasar por checkout ni pago.

### Ejemplo de mensaje generado

```
Hola Sandra,

Estoy interesado en:

- Licuadora X1 (1)
- Plancha Cabello Pro (2)

Gracias.
```

### Funcionalidades
- Construir el mensaje a partir del carrito
- Codificar el mensaje como URL (`encodeURIComponent`)
- Abrir WhatsApp con el mensaje precargado (`https://wa.me/<numero>?text=<mensaje>`)

### Servicio

```typescript
generateWhatsappMessage(cart: CartProduct[]): string;
generateWhatsappLink(message: string, phoneNumber: string): string;
```

### Nota sobre el QR
El código QR que se planteó al inicio del proyecto (el cliente arma el carrito y se genera un QR que se le muestra o envía a Sandra) queda para la Prioridad 3, como una alternativa o complemento al WhatsApp una vez validado el MVP. Ambos mecanismos son compatibles entre sí y no se excluyen.

---

## Fase 8. Validaciones

### Productos
- Nombre obligatorio (mínimo 3 caracteres)
- Precio mayor a 0
- Stock mayor o igual a 0
- Categoría obligatoria (debe existir y estar activa)
- Imagen obligatoria antes de publicar el producto en el catálogo

### Categorías
- Nombre obligatorio
- Nombre único (no permitir duplicados, comparando sin distinguir mayúsculas/minúsculas)

### Herramienta sugerida
- `zod` para validar los formularios del admin y las respuestas de la API en un solo esquema compartido entre frontend y backend.

---

## Fase 9. Testing

### Unitarios
- Utilidades
- Servicios (incluyendo `generateWhatsappMessage` y `generateWhatsappLink`)
- Formularios
- Carrito

### Integración
- CRUD productos
- CRUD categorías
- Búsqueda en catálogo
- Carrito de interés

### Objetivo mínimo
```
70% de cobertura
```

### Herramientas sugeridas
- `vitest` como test runner (más rápido y liviano que Jest, se integra bien con Vite/TypeScript).
- `@testing-library/react` para pruebas de componentes.
- Reporte de cobertura integrado en el pipeline de CI (ver Fase 11).

---

## Fase 10. Documentación GitHub

### README

Debe contener como mínimo:

**Descripción**
```
Plataforma de catálogo digital e inventario para Sanddy Almacén.
```

**Instalación**
```bash
npm install
npm run dev
```

**Arquitectura**
```
Admin
Catálogo
Carrito
WhatsApp
```

**Capturas**
```
Dashboard
Productos
Catálogo
Carrito
```

**Variables de entorno**: enlazar a `.env.example` y explicar brevemente cada grupo (AWS, base de datos, S3, admin).

**Despliegue**: pasos resumidos para desplegar en AWS (enlazar a `docs/arquitectura-aws.md`, ver Fase 11).

---

## Fase 11. CI/CD y despliegue en AWS (nueva fase, faltaba en el plan original)

### Objetivo
Que el resultado en GitHub realmente quede "listo para conectar con AWS", con un camino claro de despliegue de bajo costo.

### Arquitectura de referencia (bajo costo)
- **Catálogo público y admin (frontend)**: build estático servido desde S3 + CloudFront. Costo casi nulo con tráfico bajo, gran parte cubierta por free tier.
- **API**: API Gateway + Lambda. Se paga solo por request, ideal para ~7 consultas/mes actuales y bajo volumen general.
- **Base de datos**: DynamoDB en modo bajo demanda (pay-per-request). Cubierto ampliamente por el free tier para este volumen.
- **Imágenes**: bucket de S3 dedicado, servido a través de CloudFront.
- **Autenticación admin**: JWT propio (Fase 4.0) para el MVP; migrar a Cognito solo si en el futuro se necesitan múltiples administradores.

### CI/CD
- GitHub Actions con al menos dos workflows:
  - `ci.yml`: se ejecuta en cada pull request — corre `lint`, `typecheck`, `test` y `format:check`.
  - `deploy.yml`: se ejecuta al hacer merge a `main` — build del frontend, subida a S3, invalidación de caché de CloudFront, y despliegue de las funciones Lambda.
- Los secretos de AWS se guardan como GitHub Secrets, nunca en el repositorio.

### Documentación adicional a generar
- `docs/arquitectura-aws.md`: diagrama y explicación de cada servicio usado y su costo estimado.
- `docs/despliegue.md`: pasos manuales de despliegue por si el pipeline falla o se necesita hacerlo a mano.

---

## Backlog MVP priorizado (revisado)

### Prioridad 1 (obligatorio)
- Autenticación simulada del admin (Fase 4.0)
- CRUD Categorías
- CRUD Productos
- Catálogo público
- Búsqueda
- Filtros
- Carrito de interés
- Generador de WhatsApp

### Prioridad 2 (si sobra tiempo)
- Vista tipo Excel
- Importación CSV
- Exportación Excel/CSV
- Productos destacados

### Prioridad 3 (después del MVP)
- QR dinámico (carrito → QR, idea original del proyecto)
- Estadísticas
- Historial de solicitudes
- Múltiples administradores (con Cognito)
- Automatizaciones

---

## Resultado esperado en GitHub al finalizar el MVP

```
✅ Panel administrativo completo
✅ Gestión de categorías
✅ Gestión de productos
✅ Catálogo responsive
✅ Carrito de interés
✅ Integración WhatsApp
✅ Testing básico (>= 70% cobertura)
✅ Documentación técnica (README, arquitectura AWS, despliegue)
✅ Tipado TypeScript en todo el proyecto
✅ Pipeline de CI/CD funcionando
✅ Código listo para conectar con AWS
```

## Recomendación de alcance para la primera iteración de código

Centrar la primera iteración exclusivamente en: autenticación simulada, CRUD de categorías, CRUD de productos, catálogo público y carrito + generador de WhatsApp. Esto representa aproximadamente el 80% del valor de negocio para Sandra con cerca del 20% del esfuerzo total, dejando la vista tipo Excel, la importación/exportación y el QR dinámico para iteraciones posteriores.
