# Formulación de Objetivos — Metodología SMART

**Proyecto:** Plataforma Sanddy Almacén — Catálogo digital de autoservicio
**Cliente:** Sandra Herrera — Sanddy Almacén (belleza y pequeños electrodomésticos)
**Asignatura:** Tendencias Tecnológicas — Universidad EAN
**Fecha de elaboración:** 01-09-2026
**Fuentes analizadas:** `docs/investigacion/entrevista-cliente.md`, `docs/investigacion/contexto-proyecto.md`, `docs/investigacion/Canvas-UX-Sanddy-Almacen.html`, `docs/investigacion/StakeHolders.MD`, `docs/planificacion/roadmap-proyecto.md`, `docs/planificacion/plan-desarrollo-fases-2-11.md`, `docs/apps/architecture.md`

---

## Paso 1 — Identificación del problema y sus requerimientos

### 1.1 Problema central

> Sanddy Almacén gestiona el 100% de su catálogo, su inventario y su atención al cliente de forma manual —mediante fotos sueltas, mensajes de WhatsApp y una hoja de Excel—, por lo que **no dispone de un canal centralizado, actualizado y disponible 24/7 donde el cliente pueda consultar por sí mismo precio, características y disponibilidad de los productos**, lo que consume el tiempo productivo de la dueña y ocasiona pérdida de oportunidades de venta fuera del horario laboral.

### 1.2 Causas principales

| # | Causa | Evidencia en la documentación |
|---|---|---|
| C1 | Atención dependiente exclusivamente de la dueña, sin automatización ni respuesta fuera de horario | Entrevista, pregunta 2 · Canvas box 01 |
| C2 | Inventario gestionado de forma manual y no estructurada (fotos + Excel), que se desactualiza | Entrevista, pregunta 3 · Canvas box 01 |
| C3 | Inexistencia de un catálogo centralizado de autoservicio; el cliente debe preguntar para saber qué hay | Entrevista, preguntas 2 y 4 |
| C4 | Difusión dispersa y efímera (estados, publicaciones puntuales en redes) que no permite ver el inventario completo | Entrevista, pregunta 4 · Canvas box 01 |
| C5 | Ausencia de una fuente única de verdad sobre precio y stock, lo que obliga a repetir la misma información | Entrevista, pregunta 7 |
| C6 | Presupuesto de mantenimiento muy limitado (≈ $30.000/mes) y nulo conocimiento técnico de la administradora, que han impedido adoptar soluciones comerciales de e-commerce | Entrevista, pregunta 5 · Contexto, restricciones técnicas |

### 1.3 Efectos o consecuencias

| # | Efecto | Indicador asociado |
|---|---|---|
| E1 | Pérdida de ventas potenciales fuera del horario laboral por falta de respuesta inmediata | 0 interacciones atendidas fuera de horario hoy |
| E2 | Desgaste operativo: el tiempo de atención se consume respondiendo preguntas repetitivas en lugar de cerrar ventas | ~7 consultas/mes sobre precio, características y disponibilidad |
| E3 | Información inconsistente o desactualizada entregada al cliente (stock y precios que ya cambiaron) | Inventario sin proceso de actualización confiable |
| E4 | Experiencia de compra fragmentada: el cliente no puede explorar, comparar ni decidir con autonomía | Cliente "explorador" que no quiere "molestar" (Canvas box 03) |
| E5 | Imagen poco profesional frente a competidores con presencia digital ordenada | Canvas box 04 — "presencia profesional 24/7" |
| E6 | Imposibilidad de medir el comportamiento del cliente (qué se busca, qué se abandona) para decidir compras de mercancía | Canvas box 08 — analítica semanal |

### 1.4 Requerimientos derivados

**Requerimientos funcionales**

- RF1. Panel de administración con autenticación para un único usuario administrador (Sandra).
- RF2. CRUD completo de productos: nombre, descripción, características, precio, stock, fotografías y categoría.
- RF3. Gestión de categorías de producto.
- RF4. Vista de inventario tipo hoja de cálculo (filas/columnas editables) para edición masiva, con importación/exportación.
- RF5. Catálogo público accesible sin registro ni inicio de sesión, mediante un enlace único compartible.
- RF6. Buscador y filtros por categoría, precio y disponibilidad, con semáforo de stock (Disponible / Últimas unidades / Agotado).
- RF7. Ficha de producto con metadatos para compartir (OpenGraph) por WhatsApp y redes sociales.
- RF8. Carrito o "lista de interés" sin pasarela de pago, que genere un resumen de pedido.
- RF9. Envío del resumen del pedido a la dueña mediante mensaje precargado de WhatsApp (código QR como evolución posterior).

**Requerimientos no funcionales**

- RNF1. Diseño *mobile-first*: la mayoría del tráfico llega desde WhatsApp y redes sociales en celular.
- RNF2. Costo total de operación e infraestructura **≤ $30.000 COP mensuales**.
- RNF3. Disponibilidad 24/7 del catálogo público.
- RNF4. Usabilidad para perfil no técnico: carga de un producto en **menos de 5 minutos** sin acompañamiento.
- RNF5. Mantenibilidad y escalabilidad sin intervención técnica permanente.
- RNF6. Seguridad básica: credenciales cifradas, sesión firmada y separación estricta entre rutas públicas y administrativas.

**Requerimientos humanos**

- RH1. Equipo de desarrollo (rol de arquitecto/desarrollador full-stack y rol de diseño UX) durante el semestre académico.
- RH2. Disponibilidad de la clienta para validación, entrega de fotografías y datos reales del inventario.
- RH3. Capacitación y entrega documentada del panel administrativo a un usuario sin perfil técnico.

**Requerimientos de recursos técnicos**

- RT1. Stack web: frontend en React + TypeScript, backend en Fastify + Prisma sobre PostgreSQL (estado actual implementado en `apps/Front` y `apps/Back`).
- RT2. Infraestructura en la nube de bajo costo (*free tier* / serverless), almacenamiento de imágenes optimizado y dominio con certificado SSL.
- RT3. Repositorio Git con CI/CD automatizado y suite de pruebas.
- RT4. Herramientas de analítica web básica para medir vistas, búsquedas y abandono.

---

## Paso 2 — Criterios y prioridades

### 2.1 Criterios que deben cumplir los objetivos

| Criterio | Descripción | Umbral de aceptación |
|---|---|---|
| **CR1. Alineación con el problema** | Cada objetivo debe atacar al menos una causa (C1–C6) y mitigar un efecto (E1–E6) | 100% de trazabilidad causa → objetivo |
| **CR2. Viabilidad económica** | La solución debe operar dentro del presupuesto declarado por la clienta | ≤ $30.000 COP/mes |
| **CR3. Usabilidad para perfil no técnico** | Sandra debe poder operar el panel sin soporte permanente | < 5 min por producto; 0 errores bloqueantes en la prueba de carga |
| **CR4. Viabilidad tecnológica** | Uso de tecnologías dominadas por el equipo y con *free tier* verificado | Stack ya congelado en `roadmap-proyecto.md` |
| **CR5. Capacidad del equipo y tiempo** | Alcance ejecutable dentro del semestre académico con los sprints definidos | 5 sprints |
| **CR6. Medibilidad** | Todo objetivo debe declarar una métrica verificable, no una intención | Indicador numérico explícito |
| **CR7. Accesibilidad móvil** | La experiencia pública debe ser funcional en celular de gama media con conexión limitada | Diseño responsive y carga rápida en móvil |

### 2.2 Priorización

| Prioridad | Requerimiento / criterio | Justificación |
|---|---|---|
| 🔴 **Crítico** | Catálogo público 24/7 con precio, características, fotos y disponibilidad (RF5, RF6, RF7, RNF3) | Ataca directamente C1, C3, C4 y los efectos E1, E2 y E4: es la razón de ser del proyecto |
| 🔴 **Crítico** | Panel de administración con CRUD y edición tipo hoja de cálculo (RF1–RF4, RNF4) | Sin actualización simple el catálogo se desactualiza y el proyecto fracasa (riesgo H3 del Canvas) |
| 🔴 **Crítico** | Techo de costo de $30.000/mes (RNF2) | Restricción dura del cliente; su incumplimiento invalida la solución completa |
| 🟠 **Alto** | Carrito de interés + envío del pedido por WhatsApp (RF8, RF9) | Convierte la navegación en un pedido estructurado y conserva el canal que el cliente ya usa |
| 🟠 **Alto** | Experiencia mobile-first (RNF1, CR7) | Prácticamente todo el tráfico proviene de WhatsApp y redes sociales en celular |
| 🟡 **Medio** | Validación con usuarios reales y analítica (RT4) | Necesaria para comprobar las hipótesis H1–H5 del Lean UX Canvas |
| 🟢 **Diferido** | Chatbot / FAQ automatizada, código QR, pasarela de pagos, cuentas de cliente | Declarados fuera del alcance del MVP (Fase 2 y sección "fuera de alcance" del documento de contexto) |

---

## Paso 3 — Objetivo General

> **Desarrollar una plataforma web de catálogo digital de autoservicio, con panel de administración de inventario y generación de pedidos vía WhatsApp, para la microempresa Sanddy Almacén y sus clientes, en la ciudad de Bogotá D.C. (Colombia), durante el segundo semestre académico de 2026, que permita reducir en un 70% las consultas repetitivas sobre precio y disponibilidad, mantener el 100% del inventario publicado y actualizado, y operar con un costo mensual no superior a $30.000 COP.**

### Elementos constitutivos

| Elemento | Contenido |
|---|---|
| **Verbo en infinitivo** | *Desarrollar* |
| **Evento de estudio** | *Una plataforma web de catálogo digital de autoservicio, con panel de administración de inventario y generación de pedidos vía WhatsApp* |
| **Unidades de estudio** | *La microempresa Sanddy Almacén (Sandra Herrera, administradora) y sus clientes compradores y exploradores* |
| **Contexto** | *Ciudad de Bogotá D.C., Colombia* |

### Verificación SMART

| Criterio | Cumplimiento |
|---|---|
| **S — Específico** | Define exactamente qué se construye (catálogo público + panel administrativo + generación de pedido por WhatsApp), para quién y dónde |
| **M — Medible** | −70% de consultas repetitivas · 100% del inventario publicado y actualizado · costo ≤ $30.000 COP/mes |
| **A — Alcanzable** | Stack tecnológico ya congelado y parcialmente implementado; infraestructura en *free tier*; alcance acotado a 5 sprints |
| **R — Relevante** | Resuelve las causas C1–C5 y los efectos E1–E4 identificados en la entrevista con la clienta |
| **T — Temporal** | Segundo semestre académico de 2026 (5 sprints) |

---

## Paso 4 — Objetivos Específicos

1. **Caracterizar** el proceso actual de gestión de inventario y atención al cliente de Sanddy Almacén mediante entrevista, mapa de empatía y Lean UX Canvas, estableciendo una línea base cuantificada de las consultas repetitivas mensuales, el tiempo de atención por venta y el estado del inventario, en un plazo máximo de dos semanas.

2. **Diseñar** la arquitectura técnica, el modelo de datos relacional y los prototipos de interfaz *mobile-first* del catálogo público y del panel administrativo, verificando mediante cotización documentada que el costo mensual de infraestructura no supere los $30.000 COP, antes del inicio de la construcción.

3. **Construir** los módulos funcionales de la plataforma —autenticación del administrador, CRUD de productos y categorías, vista de inventario tipo hoja de cálculo, catálogo público con buscador y filtros, y carrito de interés con generación de mensaje de pedido por WhatsApp—, cubriendo el 100% de los requerimientos funcionales RF1 a RF9 en cuatro sprints de desarrollo.

4. **Validar** el funcionamiento de la plataforma desplegada en producción con un piloto de 20 a 30 productos reales, pruebas de usabilidad con 5 clientes que localicen el precio de un producto en menos de 15 minutos, y una prueba de carga de inventario en la que la administradora publique 10 productos empleando menos de 5 minutos en cada uno, al cierre del quinto sprint.

---

## Trazabilidad problema → objetivos

| Causa | Efecto mitigado | Objetivo específico | Aporte al objetivo general |
|---|---|---|---|
| C1 — Atención dependiente de la dueña | E1, E2 | OE1, OE3 | Catálogo disponible 24/7 |
| C2 — Inventario manual y desactualizado | E3 | OE2, OE3, OE4 | Panel de inventario tipo hoja de cálculo |
| C3 — Sin catálogo centralizado | E4 | OE3 | Catálogo público con buscador y filtros |
| C4 — Difusión dispersa y efímera | E5 | OE3 | Enlace único compartible con metadatos |
| C5 — Sin fuente única de precio y stock | E2, E3 | OE3, OE4 | Base de datos única como fuente de verdad |
| C6 — Presupuesto limitado y perfil no técnico | E5, E6 | OE2, OE4 | Infraestructura ≤ $30.000/mes y usabilidad validada |

---

## Supuestos declarados

Estos puntos no están definidos explícitamente en la documentación fuente y se asumieron para poder cerrar la formulación. Conviene confirmarlos con la clienta o con el docente antes de la entrega final:

1. **Contexto geográfico.** La documentación no indica la ciudad de operación de Sanddy Almacén. Se asumió **Bogotá D.C., Colombia** por la ubicación de la Universidad EAN. Ajustar si el negocio opera en otro municipio.
2. **Horizonte temporal.** No existe un cronograma con fechas calendario; el plazo se derivó de los **5 sprints** definidos en `roadmap-proyecto.md`, ubicados en el segundo semestre académico de 2026.
3. **Línea base de la métrica de reducción.** El −70% de consultas repetitivas proviene de la hipótesis H1 del Lean UX Canvas, medida sobre las ~7 consultas mensuales reportadas en la entrevista. Es un volumen bajo, por lo que la métrica debe leerse como porcentaje sobre una base pequeña (riesgo ya señalado en el box 07 del Canvas).
4. **Stack tecnológico.** Existe una **inconsistencia entre documentos**: `roadmap-proyecto.md` congela Next.js sobre Azure (Static Web Apps + Cosmos DB), `plan-desarrollo-fases-2-11.md` planifica el despliegue en AWS, y `apps/architecture.md` describe lo realmente implementado (Vite + React en el front, Fastify + Prisma + PostgreSQL en el back). Los objetivos se redactaron de forma **neutral respecto al proveedor de nube**, condicionando únicamente el techo de costo. Se recomienda unificar la documentación en un solo documento de arquitectura vigente.
5. **Alcance del chatbot.** El Lean UX Canvas contempla FAQ + chatbot 24/7 como Fase 2. Los objetivos formulados cubren **solo el MVP (Fase 1)**, en coherencia con el documento de contexto.
