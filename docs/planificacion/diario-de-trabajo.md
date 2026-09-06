# Diario de Trabajo — Grupo Sanddy Almacén — Proyecto final trend+tech

---

## Portada

| Campo | Detalle |
|---|---|
| **Espacio de trabajo** | Diario de Trabajo — Grupo Sanddy Almacén — Proyecto final trend+tech |
| **Integrantes y roles** | **Sergio Alejandro Rey Mateus** — Documentación, relación con el cliente y definición del problema · **Brian David Pérez Herrera** — Desarrollador · Infraestructura y nube · **Stiven Daniel Melo Guayazán** — Desarrollador · Despliegue |
| **Curso** | Tendencias Tecnológicas — Universidad EAN |
| **Periodo** | Primer semestre · Segundo semestre académico de 2026 |
| **Proyecto** | **Plataforma Sanddy Almacén** — catálogo digital de autoservicio + panel de administración de inventario |
| **Cliente real** | Sandra Herrera — Sanddy Almacén (belleza y pequeños electrodomésticos) |
| **Repositorio** | `Ecommerce-solution-platform` — ramas `main`, `documentacion`, `feature/migracion-azure` |
| **Fecha de elaboración de este diario** | 06 de septiembre de 2026 |
| **Periodo cubierto** | 16 de agosto de 2026 — 06 de septiembre de 2026 |

> **Nota de método.** Este diario está reconstruido sobre **evidencia verificable del repositorio**: los 11 commits de las 4 ramas, los 2 *pull requests* fusionados, los archivos de `docs/` y el código de `apps/`. Cada entrada cierra con la sección **Evidencia**, donde se citan los *hashes* de commit y los archivos que respaldan lo descrito. Cuando algo se afirma sin respaldo directo en el repositorio, se marca explícitamente como *(inferido)*. La semana sin actividad registrada también se documenta como tal, en lugar de rellenarse.
>
> **Nota sobre autoría y commits.** El repositorio registra **dos cuentas de Git** (`stivenmelo` y `Lavadora720`/Brian Perez), porque sólo los dos roles de desarrollo trabajaron directamente contra el repositorio. El trabajo de **documentación, cliente y definición del problema** (entrevista, contexto, Lean UX Canvas, mapa de empatía, encuesta, stakeholders y objetivos SMART) es autoría de **Sergio Alejandro Rey Mateus**, y se integró al repositorio a través de los commits de sus compañeros. En cada entrada y en la tabla de entregables se distingue explícitamente **quién es el autor del contenido** de **quién ejecutó el commit**.

---

## Índice

1. [Portada](#portada)
2. [Marco de trabajo: Definir → Idear → Validar](#1-marco-de-trabajo-definir--idear--validar)
3. [Reparto de responsabilidades del equipo](#2-reparto-de-responsabilidades-del-equipo)
4. [Entradas diarias](#3-entradas-diarias)
   - [Entrada 01 · 16-08-2026 · Arranque del repositorio y Fase 1](#entrada-01--16-08-2026--arranque-del-repositorio-y-fase-1)
   - [Entrada 02 · 17-08-2026 · Lean UX Canvas, mapa de empatía e hipótesis](#entrada-02--17-08-2026--lean-ux-canvas-mapa-de-empatía-e-hipótesis)
   - [Entrada 03 · 20-08-2026 · Publicación de la investigación y stakeholders](#entrada-03--20-08-2026--publicación-de-la-investigación-y-stakeholders)
   - [Entrada 04 · 23-08-2026 (mañana) · Prototipo funcional: monorepo + backend completo](#entrada-04--23-08-2026-mañana--prototipo-funcional-monorepo--backend-completo)
   - [Entrada 05 · 23-08-2026 (tarde/noche) · Integración, PR #1 y PR #2 (migración a Azure)](#entrada-05--23-08-2026-tardenoche--integración-pr-1-y-pr-2-migración-a-azure)
   - [Entrada 06 · 24-08 al 31-08-2026 · Semana sin commits: análisis y bloqueo](#entrada-06--24-08-al-31-08-2026--semana-sin-commits-análisis-y-bloqueo)
   - [Entrada 07 · 01-09-2026 · Formulación de objetivos SMART](#entrada-07--01-09-2026--formulación-de-objetivos-smart)
   - [Entrada 08 · 04-09 y 05-09-2026 · Reorientación del despliegue: monolito Docker](#entrada-08--04-09-y-05-09-2026--reorientación-del-despliegue-monolito-docker)
   - [Entrada 09 · 06-09-2026 · Cierre de iteración, auditoría y este diario](#entrada-09--06-09-2026--cierre-de-iteración-auditoría-y-este-diario)
5. [Documentos adjuntos y entregables](#4-documentos-adjuntos-y-entregables)
6. [Trazabilidad completa del repositorio](#5-trazabilidad-completa-del-repositorio)
7. [Reflexión crítica del periodo](#6-reflexión-crítica-del-periodo)
8. [Estado del producto y próximos pasos](#7-estado-del-producto-y-próximos-pasos)
9. [Autoevaluación frente a la rúbrica](#8-autoevaluación-frente-a-la-rúbrica)

---

## 1. Marco de trabajo: Definir → Idear → Validar

El proyecto se condujo con el ciclo **Lean UX** que exige el reto. La tabla resume, para cada paso, **qué se hizo**, **quién fue responsable** y **dónde está la evidencia**. La regla que seguimos fue la que pide el enunciado: *la decisión es grupal, la ejecución es individual*.

### Fase DEFINIR

| Paso | Decisión grupal | Ejecución individual | Evidencia |
|---|---|---|---|
| **Declarar suposiciones** | Se acordó en conjunto que el problema central era la ausencia de autoservicio 24/7, y no "no tener página web" | **Sergio**: entrevista a la clienta, documento de contexto, análisis de stakeholders y consolidación de los supuestos declarados | `entrevista-cliente.md`, `contexto-proyecto.md`, `StakeHolders.MD`, sección *Supuestos declarados* de `objetivos-smart.md` |
| **Crear hipótesis** | H1–H5 se definieron de forma conjunta en el Lean UX Canvas (box 06) | **Sergio**: redacción y maquetación del canvas y del mapa de empatía | `Canvas-UX-Sanddy-Almacen.html` (box 06), `Mapa_Empatia_Sanddy_Almacen.html` |
| **Diseñar experimentos** | Se acordó qué se medía y con qué umbral (box 08 del canvas) | **Sergio**: encuesta MS Forms y métricas de negocio del box 02 · **Brian**: verificación de la viabilidad económica de los umbrales (costo de nube) | `Encuesta_Sanddy_Almacen_MSForms.docx`, boxes 07 y 08 del canvas |

**Hipótesis del equipo (box 06 del Lean UX Canvas):**

| # | Hipótesis | Riesgo asociado (box 07) | Experimento de validación (box 08) |
|---|---|---|---|
| **H1** | Un catálogo 24/7 reduce en 70 % las consultas repetitivas | Los clientes siguen prefiriendo preguntar por WhatsApp · el volumen (~7 consultas/mes) es tan bajo que no justifica la inversión | MVP concierge de 2–4 semanas midiendo visitas y clics a WhatsApp; comparar consultas antes/después |
| **H2** | Una FAQ + chatbot elimina las ventas perdidas fuera de horario | El chatbot responde mal y genera desconfianza | 20 preguntas reales al chatbot, meta 80 % correctas |
| **H3** | Un panel simple mantiene el inventario al día en < 5 min por producto | Sandra no actualiza el catálogo por falta de tiempo o por curva de aprendizaje | Sandra publica 10 productos, meta < 5 min cada uno |
| **H4** | Un botón de WhatsApp precargado aumenta la conversión | — | Medición de clics sobre el botón durante el piloto |
| **H5** | Buscador y filtros hacen que el cliente explorador compre más | Poco tráfico si no se difunde en redes · fotos y descripciones flojas restan confianza | Test de usabilidad con 5 clientes: hallar el precio de un producto en < 15 min |

### Fase IDEAR

| Paso | Decisión grupal | Ejecución individual | Evidencia |
|---|---|---|---|
| **Construir prototipos** | Alcance del MVP: Fase 1 = catálogo público + panel + botón de WhatsApp; chatbot y QR quedan en Fase 2 | **Brian**: scaffold, tooling y estructura de carpetas (Fase 1), plan de fases 2–11 · **Stiven**: implementación completa de `apps/Front` y `apps/Back` | Commits `fea63df`, `6fba7f3` |
| **Colaborar y comunicar** | Flujo de trabajo por ramas + *pull request* con revisión de otro integrante | **Brian**: revisión y *merge* de los PR #1 y #2 · **Stiven**: apertura de la rama `documentacion` y documentación técnica de `docs/apps` · **Sergio**: interlocución con la clienta y traducción de sus necesidades a requerimientos | PR #1 (`6db8d28`), PR #2 (`65ac45c`), `docs/apps/*`, `entrevista-cliente.md` |
| **Obtener retroalimentación** | Se aceptó como retroalimentación válida la contradicción detectada entre el plan y el código, y se corrigió el plan, no el código | **Brian**: plan de reconciliación con la nube · **Sergio**: documento de supuestos que deja constancia escrita de la inconsistencia | `plan-migracion-azure.md` (Fase 0), supuesto 4 de `objetivos-smart.md` |

### Fase VALIDAR

| Paso | Decisión grupal | Ejecución individual | Evidencia |
|---|---|---|---|
| **Medir resultados** | Métricas comprometidas: −70 % consultas, 100 % inventario actualizado, ≤ $30.000 COP/mes | **Sergio**: formulación SMART con umbrales verificables y matriz de trazabilidad causa → objetivo | `objetivos-smart.md`, pasos 2 a 4 |
| **Iterar** | Dos iteraciones de arquitectura ejecutadas: (1) AWS → Azure, (2) Azure multi-servicio → monolito de un solo origen | **Brian**: iteración 1 (nube) · **Stiven**: iteración 2 (despliegue) | `e09e9d5` frente a `b27b236`; `docs/apps/despliegue.md` |
| **Refinar el producto** | Refinamientos aceptados: imágenes a base de datos, API bajo `/api`, endurecimiento de seguridad | **Stiven**: migración `add_imagenes_en_bd`, `plugins/static.ts`, `Dockerfile` | `b27b236`, `apps/Back/prisma/migrations/20260905030820_add_imagenes_en_bd/` |

---

## 2. Reparto de responsabilidades del equipo

El equipo son **tres integrantes con tres frentes diferenciados**. La actividad en Git (`git shortlog -sne --all`: 11 commits, 2 cuentas) refleja únicamente a los dos roles de desarrollo, porque el frente de documentación y cliente entrega documentos que se integran al repositorio a través de los commits de los desarrolladores.

| Integrante | Rol asumido | Responsabilidad concreta | Entregables propios | Huella en Git |
|---|---|---|---|---|
| **Sergio Alejandro Rey Mateus** | **Documentación · Cliente · Problema** | Interlocución con Sandra Herrera, levantamiento y validación de requerimientos, definición formal del problema, artefactos UX y redacción de los documentos del reto | Entrevista al cliente, documento de contexto, **Lean UX Canvas** (H1–H5, riesgos, experimentos), **mapa de empatía**, encuesta de validación, análisis de stakeholders, **objetivos SMART** (causas, efectos, RF/RNF/RH/RT, trazabilidad y supuestos) | Sin cuenta propia: su contenido entra por los commits `df3f610` y `fc10f9b` |
| **Brian David Pérez Herrera** (`Lavadora720`) | **Desarrollador · Nube** | Infraestructura, tooling, estrategia de despliegue en la nube y revisión de los *pull requests* | Fase 1 (monorepo, TypeScript, ESLint, Prettier, Husky), plan de desarrollo de fases 2–11, roadmap técnico, abstracción de almacenamiento (`storage.ts` + Azurite), plan y ejecución de la **migración a Azure** | 5 commits propios + 2 *merges* de PR |
| **Stiven Daniel Melo Guayazán** (`stivenmelo`) | **Desarrollador · Despliegue** | Construcción de la aplicación completa y puesta en producción | `apps/Front` + `apps/Back` completos (Fastify + Prisma + React), 6 modelos de datos y 3 migraciones, autenticación JWT, **monolito Docker**, guía de despliegue Render + Neon, documentación técnica de `docs/apps` | 4 commits |

**Decisiones que sí fueron grupales** (y que por eso no aparecen atribuidas a una sola persona): el enunciado del problema, las hipótesis H1–H5, el alcance del MVP, el techo de costo de $30.000 COP/mes y el abandono formal de Cosmos DB / Azure Functions / Next.js.

**Cómo se articularon los tres frentes.** Sergio define *qué problema se resuelve y cómo se mide*; Brian define *dónde y sobre qué infraestructura corre*; Stiven define *cómo se construye y cómo se publica*. Las tres dependencias reales del periodo fueron: los requerimientos RF1–RF9 de Sergio dieron el alcance que Stiven implementó el 23-08; el techo de costo de $30.000 COP/mes que Sergio levantó en la entrevista condicionó toda la estrategia de nube de Brian; y la inconsistencia documental que Brian corrigió el 23-08 fue la que Sergio dejó registrada por escrito el 01-09.

---

## 3. Entradas diarias

---

### Entrada 01 · 16-08-2026 · Arranque del repositorio y Fase 1

**Responsables del día:** Brian Pérez (desarrollo e infraestructura) · Sergio Rey (entrevista y contexto del cliente) · **Semana 1**

#### Objetivos del día
- Dejar el repositorio inicializado y con una estructura de carpetas acordada.
- Volcar en el repositorio el resultado de la entrevista con la clienta.
- Congelar una primera versión del plan de trabajo por fases.

#### Actividades realizadas
1. **19:41 —** Inicialización del repositorio (`chore: initial repository setup`): sólo un `README.md`.
2. **21:52 —** Fase 1 completa (`fase 1 proyecto`, 3.016 líneas insertadas en 20 archivos): estructura de monorepo con `apps/web/`, carpetas `src/{admin,catalog,components,hooks,models,services,types,utils}`, `tests/`, configuración de **TypeScript**, **ESLint**, **Prettier** y **Husky**, y `package.json` en la raíz.
3. **21:52 —** Publicación de los dos documentos de descubrimiento redactados por **Sergio**: `docs/contexto-proyecto.md` (96 líneas) y `docs/entrevista-cliente.md` (88 líneas), producto de la entrevista directa con Sandra Herrera. *(Contenido de Sergio, subido al repositorio por Brian dentro del mismo commit.)*
4. **21:52 —** Publicación del `docs/plan-desarrollo-fases-2-11.md` (449 líneas), que corrige el plan original: introduce la **Fase 4.0 de autenticación** que faltaba, completa los modelos de datos, sustituye el QR por un **generador de mensajes de WhatsApp** en el MVP, y agrega la **Fase 11 de CI/CD** que el plan original no contemplaba.
5. **22:03 —** Commit `Datos importantes`: `roadmap-proyecto.md` (190 líneas) con la pila tecnológica congelada y el desglose por 5 *sprints*.

#### Logros alcanzados
- Repositorio operativo con historial limpio desde el primer commit.
- **Levantamiento de requerimientos cerrado** (Sergio), con datos duros de la clienta que después atravesarían todo el proyecto: presupuesto de **$30.000 COP/mes**, **~7 consultas/mes**, inventario en Excel + fotos sueltas, canal actual WhatsApp/redes.
- Plan de 11 fases con alcance explícito y, sobre todo, con **fuera de alcance explícito** (sin pasarela de pago, sin cuentas de cliente, sin facturación).

#### Desafíos encontrados
- **El plan original tenía huecos estructurales**: no había fase de autenticación pese a que el backlog la mencionaba, y no había fase de despliegue, con lo que "listo para conectar con la nube" era una frase sin respaldo.
- **Contradicción de proveedor de nube dentro del mismo día**: `plan-desarrollo-fases-2-11.md` corrigió "Azure" por **AWS**, mientras que `roadmap-proyecto.md`, escrito 11 minutos después, congelaba **Azure + Cosmos DB + Next.js**.

#### Soluciones implementadas
- Se numeraron las fases faltantes como **Fase 4.0** y **Fase 11**, y se documentó de forma explícita, en la cabecera del plan, qué se corrigió respecto al original — para que los cambios de alcance quedaran como decisiones tomadas, no como olvidos.
- La contradicción AWS/Azure **no se resolvió ese día**: quedó latente y detonó la reconciliación de la Entrada 05. Se registra aquí porque es el origen real del problema.

#### Reflexión
La Fase 1 se ejecutó con criterio profesional (linters, *hooks* de pre-commit, tipado estricto) sobre una arquitectura que todavía no estaba decidida. Fue trabajo bien hecho sobre un cimiento provisional: buena parte de ese *tooling* se descartó en la Entrada 04. Aprendizaje: **el orden correcto es congelar la pila y después montar el tooling**, no al revés.

#### Evidencia
`6383298`, `fea63df`, `6b36816` — rama `main`.

---

### Entrada 02 · 17-08-2026 · Lean UX Canvas, mapa de empatía e hipótesis

**Responsables:** decisión grupal (H1–H5) · ejecución de Sergio Rey · **Semana 1**

#### Objetivos del día
- Traducir la entrevista a un artefacto de decisión, no sólo de registro.
- Formular hipótesis falsables y, para cada una, el riesgo que la puede tumbar y el experimento que la valida.
- Identificar a quién se le sirve primero.

#### Actividades realizadas
1. Construcción del **Lean UX Canvas V2** (8 cajas, fechado `17-08-2026`, iteración 1) con la estructura: *problema → solución → resultado de negocio* arriba, *a quién servimos y qué gana* en medio, *apuestas → riesgos → validación* abajo.
2. Construcción del **mapa de empatía** con dos fichas: *cliente comprador final* y *Sandra Herrera*, cada una con las seis dimensiones (piensa/siente, oye, ve, dice/hace, le duele, aspira).
3. Formulación de las **hipótesis H1–H5** y de los **8 riesgos** del box 07, cada riesgo etiquetado con la hipótesis que amenaza.
4. Definición de los **9 experimentos** del box 08, con umbral numérico cada uno.
5. Definición de las **métricas accionables** (box 02) y, explícitamente, de las **métricas de vanidad a evitar**: "visitas o *me gusta* sin ventas concretadas".

#### Logros alcanzados
- Cuatro segmentos de usuario diferenciados y priorizados: Sandra (administradora), cliente comprador, **cliente explorador** (el que "no quiere molestar") y usuario que llega por recomendación vía enlace. El *explorador* es un hallazgo del canvas que no estaba en la entrevista y que justifica por sí solo el buscador y los filtros (H5).
- Todo riesgo quedó trazado a una hipótesis, y toda hipótesis a un experimento medible.

#### Desafíos encontrados
- **La métrica estrella descansa sobre una base muy pequeña.** Prometer "−70 % de consultas repetitivas" sobre ~7 consultas al mes significa pasar de 7 a 2. Estadísticamente es ruido.
- **Riesgo de proyecto, no de producto:** el propio canvas admite que "el volumen bajo no justifica invertir" (box 07). Es un riesgo que ataca la razón de ser del trabajo.

#### Soluciones implementadas
- El riesgo se **dejó escrito en el canvas** en lugar de esconderlo, y más adelante se recogió formalmente como **supuesto 3** del documento de objetivos SMART, con la indicación de que el porcentaje debe leerse como *porcentaje sobre base pequeña*.
- Se complementó la métrica cuantitativa con métricas cualitativas menos sensibles al volumen: tiempo de atención por venta e interacciones fuera de horario (0 → 3+).

#### Reflexión
La tentación era maquillar la métrica para que luciera mejor en la entrega. Se optó por documentar la debilidad. Un objetivo que sólo se cumple si nadie mira la base de cálculo no es un objetivo, es una decoración.

#### Evidencia
`docs/investigacion/Canvas-UX-Sanddy-Almacen.html` (fechado `17-08-2026`), `docs/investigacion/Mapa_Empatia_Sanddy_Almacen.html` (pie: `17.08.2026`). Autoría de contenido: **Sergio Rey**. Ambos versionados tres días después en el commit `df3f610`, ejecutado por Stiven.

---

### Entrada 03 · 20-08-2026 · Publicación de la investigación y stakeholders

**Responsables:** Sergio Rey (contenido y análisis) · Stiven Melo (versionado en el repositorio) · **Semana 1**

#### Objetivos del día
- Subir al repositorio los artefactos UX para que dejen de ser archivos locales.
- Completar el análisis de partes interesadas que el canvas no cubría.

#### Actividades realizadas
1. **13:45 —** Commit `df3f610` (950 líneas en 5 archivos, rama `documentacion`), ejecutado por **Stiven** para integrar el material producido por **Sergio**: Lean UX Canvas en HTML y DOCX, mapa de empatía en HTML, encuesta de validación en formato MS Forms y `StakeHolders.MD`.
2. **Sergio** — redacción del análisis de stakeholders separando dos niveles: los **explícitos** en el box 03 del canvas y los **implícitos**, que el canvas da por sentados.
3. **Sergio** — diseño de la encuesta de validación sobre descubrimiento de producto y preferencias de compra (experimento asociado a H1 y H2).

#### Logros alcanzados
- Identificación de cinco stakeholders implícitos que ningún documento anterior nombraba: el equipo de desarrollo, el proveedor de hosting y dominio, **WhatsApp/Meta como dependencia externa crítica**, el proveedor del chatbot y las redes sociales como canal de difusión.
- Detección de una **ausencia relevante**: los proveedores de mercancía no aparecen en ningún artefacto, pese a que de ellos depende el stock que el catálogo promete mostrar.

#### Desafíos encontrados
- El canvas trata WhatsApp como si fuera parte del proyecto, cuando en realidad es una **plataforma de terceros sobre la que el equipo no tiene control**. Todo el flujo de cierre de venta depende de ella.
- La sección de riesgos del canvas medía riesgos de producto, pero ninguno de **dependencia externa** ni de **presupuesto**.

#### Soluciones implementadas
- Se documentaron los stakeholders implícitos con su vía de influencia concreta (por ejemplo: el proveedor de hosting influye directamente sobre el techo de $30.000/mes del box 07).
- Se dejó planteada como pregunta abierta para la clienta la dependencia de proveedores de mercancía, en lugar de inventar una respuesta.

#### Reflexión
Un mapa de stakeholders no vale por los nombres que lista, sino por los que descubre. Aquí lo valioso fue lo *no dicho*: la totalidad del cierre de venta descansa sobre una plataforma que puede cambiar sus reglas sin avisarnos, y esa dependencia sigue sin tener plan de contingencia.

#### Evidencia
`df3f610` — rama `documentacion`. Contenido de **Sergio Rey**, commit ejecutado por **Stiven Melo**.

---

### Entrada 04 · 23-08-2026 (mañana) · Prototipo funcional: monorepo + backend completo

**Responsable del día:** Stiven Melo (desarrollador · despliegue) · **Semana 1** · *Jornada de mayor volumen de todo el periodo*

#### Objetivos del día
- Pasar de documentos a **software que corre**.
- Resolver la decisión pendiente del roadmap: reestructurar el repositorio existente o arrancar uno nuevo.
- Cubrir de una vez los requerimientos funcionales RF1 a RF9.

#### Actividades realizadas
1. **14:34 —** Commit `6fba7f3`, el más grande del proyecto: reestructuración a monorepo `apps/Front` + `apps/Back`, con backend nuevo y completo.
2. **Backend (`apps/Back`)** — Fastify 5 + Prisma 6 + PostgreSQL 16:
   - `schema.prisma` con 5 modelos: `Categoria`, `Producto`, `Pedido`, `LineaPedido`, `Usuario`.
   - Dos migraciones: `20260823161005_init` y `20260823164130_add_usuario_auth`.
   - Rutas por recurso: `auth`, `categorias`, `productos`, `pedidos`, `uploads`, `health`.
   - Autenticación real: **bcrypt + JWT en cookie `httpOnly`/`SameSite=Lax`, 8 horas**, con decorador `requireAuth` sobre todas las rutas de escritura.
   - `seed.ts` idempotente: 3 categorías, 12 productos y el usuario admin, sin pisar la contraseña si ya existe.
   - `docker-compose.yml` con Postgres `16-alpine` en el contenedor `sanddy-db`.
3. **Frontend (`apps/Front`)** — React + TypeScript + Vite + Tailwind v4:
   - Catálogo público: `Catalog.tsx`, `ProductCard.tsx`, `ProductDialog.tsx`.
   - Carrito y *checkout*: `Cart.tsx`, con generación de **código QR** y enlace de WhatsApp.
   - Panel de administración: `Admin.tsx` y `SheetRow.tsx` (tabla editable tipo hoja de cálculo), `ProductForm.tsx`, `Categories.tsx`, `Orders.tsx`.
   - Importación/exportación **CSV** (`csv.ts`, `CsvPreview.tsx`) con las mismas columnas que exporta el panel.
   - Compresión de imágenes en el navegador antes de subirlas (`admin/image.ts`, canvas → JPEG 800 px).
   - `services/store.ts` como **única frontera con el backend**: ningún otro archivo llama a `fetch`.
4. Reorganización de la documentación en `docs/apps`, `docs/investigacion` y `docs/planificacion`, y borrado de los archivos sueltos de la raíz que quedaron obsoletos (`package.json`, `eslint.config.js`, carpetas `src/*` con `.gitkeep`).

#### Logros alcanzados
- **MVP funcional de punta a punta**: un visitante navega el catálogo, arma su lista de interés, confirma, y el sistema genera un pedido con código `SA-XXXX`, su QR y el enlace de WhatsApp; la administradora entra a `/admin`, edita el inventario como en una hoja de cálculo y ve el historial de pedidos.
- **Cobertura de RF1 a RF9** en una sola jornada.
- Tres decisiones de modelado que resultaron acertadas y siguen en pie:
  - `LineaPedido` copia `productoNombre` y `precioUnitario` en el momento del pedido → el historial no se altera si el producto cambia o se borra después.
  - `precio` es **entero de pesos colombianos**, sin decimales → no hay errores de redondeo en coma flotante.
  - `POST /pedidos` **no descuenta stock**, porque es una lista de interés y no una venta cerrada.

#### Desafíos encontrados
- **El scaffold de la Fase 1 no servía.** Estaba pensado para una aplicación plana con `apps/web`, no para dos proyectos npm independientes con backend propio.
- **La decisión pendiente del roadmap seguía sin resolver**, y no se podía escribir la primera línea de código sin cerrarla.
- **El roadmap especificaba Next.js + Cosmos DB + Zustand + Zod**, y ninguna de esas cuatro piezas encajaba en lo que el proyecto necesitaba realmente.

#### Soluciones implementadas
- Se eligió la **opción 1** de las dos que planteaba el roadmap: reestructurar el repositorio existente, conservando historial y documentación. El costo fue borrar `package.json`, `eslint.config.js` y las carpetas vacías de la raíz.
- Se sustituyó el stack del roadmap por uno defendible: **Vite + React** en vez de Next.js (el SEO no aporta cuando el tráfico entra por enlace de WhatsApp), **PostgreSQL relacional** en vez de Cosmos DB (el modelo tiene relaciones reales: pedido → líneas → producto → categoría), y **`localStorage` + estado de React** en vez de Zustand (el carrito no justifica una librería de estado global).
- El carrito en curso se dejó deliberadamente en `localStorage`: es estado transitorio del navegador y sólo al confirmar se convierte en `POST /pedidos`.

#### Reflexión
Aquí se tomó **la decisión técnica más importante del proyecto**: no obedecer el roadmap. Es una decisión incómoda, porque el roadmap era un entregable del propio equipo. Pero el roadmap se escribió antes de conocer el modelo de datos, y el modelo de datos resultó ser inequívocamente relacional. El error real no fue desviarse del plan: fue **no actualizar el plan el mismo día**, y eso costó la contradicción documental que hubo que pagar más adelante (Entrada 07). Aprendizaje: *un plan que el código contradice y que nadie corrige deja de ser un plan y pasa a ser desinformación*.

#### Evidencia
`6fba7f3` — rama `documentacion`.

---

### Entrada 05 · 23-08-2026 (tarde/noche) · Integración, PR #1 y PR #2 (migración a Azure)

**Responsables:** Brian Pérez (desarrollador · nube: revisión, *merge* e implementación) · Stiven Melo (código integrado) · **Semana 1**

#### Objetivos del día
- Integrar a `main` el trabajo de la rama `documentacion` mediante *pull request* revisado.
- Resolver la incompatibilidad entre el plan de nube y lo que realmente se había construido.
- Dejar la plataforma en condiciones de desplegarse.

#### Actividades realizadas
1. **18:21 —** *Merge* del **PR #1** (`Lavadora720/documentacion` → `main`, commit `6db8d28`): el monorepo y el backend completo entran a la rama principal, revisados por el otro integrante.
2. **20:03 —** Commit `dea3323` — `feat(storage): soportar Azure Blob Storage con fallback a disco local`:
   - `src/services/storage.ts` (nuevo): abstracción única que decide el destino según `STORAGE_DRIVER`, con `local` por defecto.
   - `routes/uploads.ts`: delega en `storage.ts` en vez de escribir a disco.
   - `store.ts` (front): `uploadImagen` deja de anteponer `VITE_API_URL` cuando el backend ya devuelve una URL absoluta.
   - `docker-compose.yml`: servicio opcional **`azurite`**, para probar el driver de Azure en local sin cuenta real.
3. **20:05 —** Commit `e09e9d5` — `feat: preparar plataforma para migracion a Azure` (1.794 líneas insertadas en 18 archivos): `.env.production.example`, `staticwebapp.config.json`, endurecimiento de seguridad (`secure: true` en cookies, CORS por dominio real), `plan-migracion-azure.md`, `despliegue-azure.md` (478 líneas), `como-desplegar.md` (254 líneas) y `update-azure.md` (205 líneas). El `roadmap-proyecto.md` se reescribe (267 líneas modificadas) con el stack real.
4. **20:07 —** *Merge* del **PR #2** (`feature/migracion-azure` → `main`, commit `65ac45c`).

#### Logros alcanzados
- **Reconciliación formal plan ↔ código.** La Fase 0 del plan de migración dejó por escrito el abandono de Cosmos DB, Azure Functions y Next.js, con su razón: *"reescribir esas tres capas no da ningún beneficio funcional nuevo"*.
- **Principio de diseño explícito y valioso**, que sobrevivió a todo lo demás: *cada integración nueva se controla por variable de entorno, con un valor por defecto que sigue usando lo local; el código de la aplicación no debe tener ramas `if (isAzure)`*.
- Documentación de despliegue completa y las vulnerabilidades *high* de `npm audit` resueltas.
- Trabajo integrado por *pull request* con revisión cruzada: dos ramas, dos PR, cero *commits* directos a `main` en esta fase.

#### Desafíos encontrados
- **El disco local no sirve en la nube**: no es persistente ni se comparte entre instancias, así que las imágenes subidas se perderían en cada reinicio o escalado.
- **Riesgo de romper el entorno local** al añadir integraciones de nube.
- **Riesgo de gastar dinero sólo para probar** que el flujo de Blob Storage funcionaba.
- **Tres documentos apuntando a tres nubes distintas**: AWS, Azure y "lo implementado".

#### Soluciones implementadas
- Abstracción `storage.ts` con selección por variable de entorno: el mismo código sirve para disco y para Blob Storage.
- **Azurite** en `docker-compose.yml` como emulador local de Blob Storage: se probó el driver `azure` sin cuenta real ni costo.
- El `roadmap-proyecto.md` se reescribió en lugar de dejarlo obsoleto, y se dejó constancia explícita de por qué se abandonó cada tecnología, *"para que futuras personas no repitan la confusión"*.

#### Reflexión
Fue el mejor día de colaboración del periodo: dos ramas, dos PR revisados, y un integrante corrigiendo el desfase documental que había dejado el otro. También expuso el costo de la desincronización: **la migración a Azure completa se construyó, se documentó en más de 1.000 líneas y se fusionó a `main` — y doce días después quedó fuera de uso** cuando el despliegue se reorientó a un monolito. No fue trabajo inútil (el principio de configuración por entorno y el endurecimiento de seguridad siguen vivos), pero sí fue **trabajo que se pudo evitar decidiendo el destino de despliegue antes de construir para él**.

#### Evidencia
`6db8d28` (PR #1), `dea3323`, `e09e9d5`, `65ac45c` (PR #2) — ramas `feature/migracion-azure` y `main`.

---

### Entrada 06 · 24-08 al 31-08-2026 · Semana sin commits: análisis y bloqueo

**Responsables:** los tres integrantes · **Semana 2** · *Entrada registrada por honestidad de la trazabilidad*

#### Qué muestra el repositorio
**Ningún commit en ninguna rama entre el 23 de agosto (20:07) y el 1 de septiembre (19:21).** Nueve días naturales sin actividad versionada. Es el hueco más grande del periodo y se documenta como tal, en vez de rellenarlo con actividad no verificable.

#### Actividades atribuibles *(inferidas del trabajo entregado el 01-09)*
El trabajo de esta semana recae sobre el frente de **documentación y problema (Sergio)**: el documento `objetivos-smart.md`, publicado el 1 de septiembre, declara en su cabecera haber analizado **siete documentos fuente** (`entrevista-cliente.md`, `contexto-proyecto.md`, el Canvas UX, `StakeHolders.MD`, `roadmap-proyecto.md`, `plan-desarrollo-fases-2-11.md` y `architecture.md`) y contiene el árbol completo de causas C1–C6 y efectos E1–E6. Ese trabajo de análisis y contraste no se produce en una tarde; es razonable atribuirlo a esta semana. *(Inferencia, no evidencia directa: no hay commits que lo respalden.)*

#### Desafíos encontrados
- **La cadencia semanal se rompió.** El proyecto pasó de tres jornadas intensas de trabajo en una semana a nueve días de silencio en el repositorio.
- El trabajo de análisis, por su naturaleza, **no deja rastro versionado hasta que se convierte en documento**. Todo el esfuerzo de una semana se materializó en un único commit tardío.

#### Soluciones implementadas
- Al reanudar, el análisis se publicó como **documento completo y trazable**, con tablas explícitas de causa → efecto → objetivo, de modo que el resultado del periodo silencioso quedara auditable.
- Para lo que resta de proyecto se adopta la regla de **commitear el trabajo en curso** (borradores, notas de análisis) en lugar de esperar al documento terminado.

#### Reflexión
Esta entrada existe precisamente porque el hueco existe. Registrar nueve días de silencio es más útil que fabricar entradas intermedias: señala un problema real de método —**trabajo intelectual sin rastro incremental**— que es exactamente lo que un diario debería detectar. La lección no es "trabajamos menos esa semana", es "**trabajamos sin dejar evidencia, y la evidencia también es parte del entregable**".

#### Evidencia
Ausencia de commits entre `65ac45c` (23-08 20:07) y `fc10f9b` (01-09 19:21), verificada con `git log --all --date-order`.

---

### Entrada 07 · 01-09-2026 · Formulación de objetivos SMART

**Responsables:** Sergio Rey (autoría del documento) · Stiven Melo (versionado) · **Semana 3**

#### Objetivos del día
- Convertir el problema difuso en un árbol formal de causas, efectos y requerimientos.
- Redactar un objetivo general y cuatro específicos que cumplan SMART de forma verificable.
- Dejar por escrito, de una vez, todas las inconsistencias documentales pendientes.

#### Actividades realizadas
1. **19:21 —** Commit `fc10f9b`, ejecutado por **Stiven** para integrar el documento redactado por **Sergio**: `docs/planificacion/objetivos-smart.md`, 163 líneas.
2. **Paso 1** — Problema central, **6 causas (C1–C6)** y **6 efectos (E1–E6)**, cada uno referenciado a su fuente exacta (pregunta de la entrevista o caja del canvas).
3. **Paso 1.4** — Requerimientos en cuatro bloques: **9 funcionales (RF1–RF9)**, **6 no funcionales (RNF1–RNF6)**, **3 humanos (RH1–RH3)** y **4 de recursos técnicos (RT1–RT4)**.
4. **Paso 2** — Siete criterios de aceptación (CR1–CR7) con umbral numérico, y priorización en cuatro niveles (Crítico / Alto / Medio / Diferido).
5. **Paso 3** — Objetivo general con sus cuatro elementos constitutivos (verbo, evento de estudio, unidades de estudio, contexto) y verificación SMART letra por letra.
6. **Paso 4** — Cuatro objetivos específicos siguiendo el ciclo del reto: **Caracterizar** (Definir) → **Diseñar** (Idear) → **Construir** (Idear) → **Validar** (Validar).
7. Matriz final de **trazabilidad causa → efecto → objetivo específico → aporte al objetivo general**.

#### Logros alcanzados
- **Objetivo general medible**, no declarativo: reducir 70 % las consultas repetitivas, mantener el 100 % del inventario publicado y actualizado, y operar por debajo de $30.000 COP/mes, en Bogotá D.C. durante el segundo semestre de 2026.
- **100 % de trazabilidad**: no queda ninguna causa sin objetivo que la ataque, ni ningún objetivo sin causa que lo justifique.
- **Sección de supuestos declarados** con cinco puntos abiertos y honestos.

#### Desafíos encontrados
- **Faltaba el contexto geográfico**: ningún documento del proyecto dice en qué ciudad opera Sanddy Almacén, y un objetivo SMART exige contexto.
- **Faltaban fechas calendario**: el roadmap habla de *sprints*, no de días.
- **La inconsistencia de nube seguía viva en la documentación**: el roadmap congela Azure, el plan de fases planifica AWS y la arquitectura describe lo realmente construido.
- La métrica del −70 % arrastraba el problema de base pequeña ya detectado el 17-08.

#### Soluciones implementadas
- Se asumió **Bogotá D.C.** por la ubicación de la Universidad EAN, y se declaró como **supuesto 1**, señalando que debe confirmarse con la clienta.
- El horizonte temporal se derivó de los **5 sprints** del roadmap y se declaró como **supuesto 2**.
- Los objetivos se redactaron **neutrales respecto al proveedor de nube**, condicionando únicamente el techo de costo. La inconsistencia se registró como **supuesto 4**, con la recomendación explícita de unificar la documentación en un solo documento de arquitectura vigente.
- La debilidad estadística de la métrica se documentó como **supuesto 3**, remitiendo al riesgo ya señalado en el box 07 del canvas.

#### Reflexión
El aporte de este documento no son los objetivos: es la **sección de supuestos**. Cinco puntos que declaran, sin adornos, qué se asumió por falta de información. Un objetivo SMART construido sobre supuestos ocultos es SMART sólo en apariencia; declararlos convierte el documento en algo que la clienta o el docente pueden **refutar**, y sólo lo refutable es verificable. Este fue también el momento en que la deuda documental acumulada desde el 16-08 se hizo imposible de ignorar y quedó anotada por escrito.

#### Evidencia
`fc10f9b` — rama `documentacion`. Contenido de **Sergio Rey**, commit ejecutado por **Stiven Melo**.

---

### Entrada 08 · 04-09 y 05-09-2026 · Reorientación del despliegue: monolito Docker

**Responsable:** Stiven Melo (desarrollador · despliegue) · **Semana 3**

#### Objetivos del día
- Dejar la aplicación **efectivamente publicable**, no sólo "lista para desplegar".
- Resolver el problema de persistencia de imágenes de forma definitiva.
- Escribir una guía de despliegue que otra persona pueda seguir sin conocimiento previo.

#### Actividades realizadas
1. **23:40 (04-09) —** Commit `b27b236` (788 líneas insertadas, 30 archivos).
2. **Toda la API se movió bajo el prefijo `/api`** (`API_PREFIX` en `app.ts`), dejando la raíz libre para el front.
3. **`plugins/static.ts` reescrito** (44 líneas): sirve `Front/dist` desde el mismo servidor Fastify, con un `setNotFoundHandler` que devuelve el `index.html` para las rutas del SPA (`/admin`, `/carrito`) pero responde **404 en JSON** si la ruta empieza por `/api`, si no es GET o si parece un archivo (`/assets/algo.js`) — porque un *asset* faltante servido como HTML se rompe de forma ilegible en el navegador. Si `Front/dist` no existe (desarrollo), no registra nada.
4. **Imágenes migradas de disco a base de datos**: nueva migración `20260905030820_add_imagenes_en_bd`, modelo `Imagen` con columna `datos BYTEA`, nueva ruta `routes/imagenes.ts` (82 líneas) y eliminación de `routes/uploads.ts`.
5. **`resolveImagenUrl()`** en `store.ts`: `Producto.imagenes` es una lista **mixta** de rutas propias (`/imagenes/<id>`, relativas a propósito) y URLs externas (las de Unsplash del seed). Se actualizaron los cinco componentes que pintaban imágenes.
6. **Proxy de Vite** en `vite.config.ts`: reenvía `/api` al backend **sin reescribir el prefijo**, para que desarrollo y producción se comporten igual.
7. **`Dockerfile` multi-etapa** (57 líneas): construye el front, construye el back y arma una imagen final que conserva la disposición `Back/` + `Front/` del repositorio. Arranca con `prisma migrate deploy && node dist/server.js`.
8. **`docs/apps/despliegue.md`** (174 líneas): guía paso a paso para Render + Neon, con sección de problemas comunes.
9. **`CLAUDE.md`** (105 líneas): documento de convenciones vigentes del repositorio.

#### Logros alcanzados
- **Aplicación desplegable como un solo servicio**, con la API y el front en el mismo origen.
- **Persistencia de imágenes resuelta de raíz**: viven en Postgres, no en disco ni en un servicio externo. `GET /imagenes/:id` responde con `Cache-Control` inmutable a un año, porque la fila nunca se reescribe.
- Guía de despliegue con las trampas ya documentadas: usar la conexión **directa** de Neon y no la *pooled* (el contenedor migra al arrancar), no usar `migrate dev` contra producción, y `prisma` en `dependencies` y no en `devDependencies` porque el contenedor necesita el CLI después de `npm ci --omit=dev`.
- Decisión de seguridad conservada del análisis previo: **SVG excluido** de los formatos aceptados, porque es XML, puede contener un `<script>` y esta ruta lo serviría desde el mismo origen que la API.

#### Desafíos encontrados
- **La cookie de sesión hacía inviable la arquitectura de dos dominios.** La sesión del admin viaja en una cookie `SameSite=Lax`: con el front en Static Web Apps y el backend en App Service (dominios distintos), el navegador la trata como **cookie de terceros, no la envía, y el panel de administración simplemente no permite iniciar sesión**. La arquitectura fusionada el 23-08 no habría funcionado en producción.
- **Problema de tipos con Prisma**: `Bytes` se tipa como `Uint8Array<ArrayBuffer>`, no como `Buffer`, así que el resultado de `file.toBuffer()` no compilaba.
- **Orden de operaciones en la respuesta HTTP**: el `Content-Type` debe fijarse **antes** del `send()` o Fastify responde `application/octet-stream`, y el 404 debe lanzarse antes de tocar cabeceras.
- **El PostgreSQL gratuito de Render se borra a los 30 días.**

#### Soluciones implementadas
- **Monolito de un solo origen**: la cookie deja de ser de terceros por construcción, en lugar de intentar parchear `SameSite=None` + `Secure` + CORS con credenciales.
- El `Buffer` se envuelve en `new Uint8Array(...)` para satisfacer al compilador sin copiar datos.
- Cabeceras fijadas antes del `send()`; el 413 de `@fastify/multipart` (que llega en inglés) se traduce a mano al español del proyecto.
- **Base de datos en Neon** (0,5 GB, sin caducidad) en vez del Postgres de Render, con la advertencia documentada de que las fotos consumen ese espacio: ~100 KB cada una, unas 4.000–5.000 en total.
- Límites de subida explícitos: 1 archivo de 5 MB, sólo JPEG/PNG/WebP/AVIF/GIF.

#### Reflexión
Esta jornada corrigió un error de arquitectura que la del 23-08 no podía ver: **se había optimizado el despliegue por servicio (front aquí, API allá) sin verificar que el mecanismo de sesión sobreviviera a esa separación**. Es el tipo de fallo que no aparece en ninguna prueba local —donde todo es `localhost`— y que sólo se manifiesta en producción, cuando la administradora no puede entrar. Aprendizaje: **las restricciones del navegador (cookies, orígenes, CORS) son restricciones de arquitectura, no detalles de implementación**, y deben evaluarse antes de elegir la topología de despliegue, no después.

También quedó una deuda consciente: `Imagen` no tiene clave foránea hacia `Producto` a propósito (la subida ocurre antes de que el producto exista), y **nadie borra las imágenes huérfanas**. Está registrado como TODO en `routes/imagenes.ts`, con la consulta SQL de limpieza escrita en `architecture.md`. Es deuda técnica documentada, que es la única clase aceptable.

#### Evidencia
`b27b236` — rama `documentacion`.

---

### Entrada 09 · 06-09-2026 · Cierre de iteración, auditoría y este diario

**Responsables:** Stiven Melo (auditoría técnica del repositorio) · Sergio Rey (redacción del diario) · Brian Pérez (validación del estado de las ramas de nube) · **Semana 3**

#### Objetivos del día
- Auditar el estado real del repositorio frente a lo que la documentación afirma.
- Consolidar la trazabilidad de las cuatro ramas en este diario de trabajo.
- Dejar la lista de pendientes bloqueantes antes de publicar.

#### Actividades realizadas
1. Revisión de las 4 ramas (`main`, `documentacion`, `feature/migracion-azure`, `origin/HEAD`), los 11 commits y los 2 PR.
2. Contraste documento por documento entre lo escrito en `docs/` y lo implementado en `apps/`.
3. Verificación del estado del árbol de trabajo y de la divergencia entre ramas.
4. Redacción de este diario, con la matriz de responsabilidades individuales y grupales de los tres integrantes.

#### Hallazgos de la auditoría
| # | Hallazgo | Estado |
|---|---|---|
| 1 | `WHATSAPP_NUMBER` sigue en `'NUMERO_PLACEHOLDER'` en `Front/src/components/WhatsAppButton.tsx` | **Bloqueante para publicar** — el botón flotante y el cierre del carrito llevan a una dirección rota |
| 2 | `apps/Back/docker-compose.yml` está borrado en el árbol de trabajo (aún existe en `HEAD`) | **Bloqueante para desarrollo** — `docker compose up -d db` no funciona hoy; `como-correr.md` sigue describiendo ese flujo |
| 3 | `documentacion` y `main` divergen desde `6fba7f3`: 44 archivos de diferencia, 1.280 inserciones y 1.996 borrados | **Abierto** — el trabajo de despliegue más reciente no está en `main` |
| 4 | El `README.md` de la raíz lista scripts `lint`, `typecheck` y `format` que no existen | **Documentación heredada** del scaffold original |
| 5 | No hay pruebas ni ESLint configurados en ninguna de las dos apps (`apps/Front/tests/` y `docs/apps/front-tests.md` son *placeholders*) | **Abierto** — la única verificación disponible es `npm run build` |
| 6 | No hay *rate limiting* en el login | **Documentado** como limitación conocida en `routes/auth.ts` |
| 7 | Las imágenes huérfanas nunca se borran | **Documentado**, con la consulta de limpieza en `architecture.md` |
| 8 | `como-correr.md` indica `VITE_API_URL=http://localhost:3001`, pero el valor correcto tras el monolito es `/api` | **Desactualizado** |

#### Desafíos encontrados
- **La documentación envejece más rápido de lo que se corrige.** Tres documentos (`README.md` raíz, `como-correr.md`, `roadmap-proyecto.md`) describen estados que el código ya dejó atrás.
- **Dos ramas divergentes sin política de integración**: `main` tiene la migración a Azure y `documentacion` tiene el monolito, y son mutuamente excluyentes.

#### Soluciones implementadas
- Se levantó la lista de 8 hallazgos con su estado, separando lo **bloqueante** de lo **documentado** y de lo **abierto**.
- Se dejaron los pendientes ordenados por prioridad en la sección [Estado del producto y próximos pasos](#7-estado-del-producto-y-próximos-pasos).
- Este diario se incorpora como documento vivo del repositorio, en `docs/planificacion/`.

#### Reflexión
La auditoría confirma un patrón que atraviesa todo el periodo: **el equipo construye rápido y documenta bien, pero desincroniza el plan del código**. Ocurrió el 16-08 (AWS contra Azure el mismo día), el 23-08 (código contra roadmap), el 01-09 (tres documentos, tres nubes) y sigue ocurriendo hoy (dos ramas, dos arquitecturas). No es un descuido puntual: es una característica del método de trabajo del grupo que hay que corregir con una regla, no con voluntad. La regla que adoptamos es sencilla: **ningún PR se fusiona si toca arquitectura y no actualiza el documento que la describe**.

#### Evidencia
`git log --all --graph`, `git diff --stat origin/main documentacion`, `git status`, `git merge-base documentacion origin/main` → `6fba7f3`.

---

## 4. Documentos adjuntos y entregables

### Investigación y descubrimiento (fase DEFINIR)

| Documento | Contenido | Autor del contenido |
|---|---|---|
| [`docs/investigacion/entrevista-cliente.md`](../investigacion/entrevista-cliente.md) | Entrevista de levantamiento con Sandra Herrera: 7 preguntas, necesidades identificadas, resumen ejecutivo | **Sergio Rey** |
| [`docs/investigacion/contexto-proyecto.md`](../investigacion/contexto-proyecto.md) | Contexto del cliente, problemática, solución a construir, restricciones técnicas, alcance y fuera de alcance | **Sergio Rey** |
| [`docs/investigacion/Canvas-UX-Sanddy-Almacen.html`](../investigacion/Canvas-UX-Sanddy-Almacen.html) | Lean UX Canvas V2 (8 cajas), con H1–H5, 8 riesgos y 9 experimentos | **Sergio Rey** |
| [`docs/investigacion/Canvas_UX_Sanddy_Almacen.docx`](../investigacion/Canvas_UX_Sanddy_Almacen.docx) | El mismo canvas en formato entregable | **Sergio Rey** |
| [`docs/investigacion/Mapa_Empatia_Sanddy_Almacen.html`](../investigacion/Mapa_Empatia_Sanddy_Almacen.html) | Mapa de empatía, 2 fichas (cliente comprador y Sandra Herrera) | **Sergio Rey** |
| [`docs/investigacion/Encuesta_Sanddy_Almacen_MSForms.docx`](../investigacion/Encuesta_Sanddy_Almacen_MSForms.docx) | Encuesta de validación de descubrimiento de producto | **Sergio Rey** |
| [`docs/investigacion/StakeHolders.MD`](../investigacion/StakeHolders.MD) | Stakeholders explícitos e implícitos, y ausencias detectadas | **Sergio Rey** |

### Planificación (fase IDEAR)

| Documento | Contenido | Autor del contenido |
|---|---|---|
| [`docs/planificacion/objetivos-smart.md`](./objetivos-smart.md) | Árbol causa-efecto, RF/RNF/RH/RT, criterios, objetivo general y 4 específicos, trazabilidad y supuestos | **Sergio Rey** |
| [`docs/planificacion/plan-desarrollo-fases-2-11.md`](./plan-desarrollo-fases-2-11.md) | Plan de 10 fases: modelo de datos, componentes, autenticación, panel, catálogo, carrito, WhatsApp, validaciones, *testing*, CI/CD | **Brian Pérez** |
| [`docs/planificacion/roadmap-proyecto.md`](./roadmap-proyecto.md) | Decisiones congeladas y roadmap por 5 *sprints*. **Desactualizado** respecto al código: tratar como historia de decisiones | **Brian Pérez** |
| `docs/planificacion/plan-migracion-azure.md` *(sólo en la rama `main`)* | Plan de 7 fases para la migración a Azure, con su Fase 0 de principio de diseño | **Brian Pérez** |
| [`docs/planificacion/diario-de-trabajo.md`](./diario-de-trabajo.md) | **Este documento** | **Sergio Rey** (redacción) · **Stiven Melo** (auditoría de trazabilidad) |

### Documentación técnica (fase VALIDAR / REFINAR)

Autoría de **Stiven Melo** (desarrollador · despliegue), salvo indicación contraria.

| Documento | Contenido |
|---|---|
| [`docs/apps/README.md`](../apps/README.md) | Puerta de entrada técnica: resumen de ejecución, acceso al panel, datos y ajustes |
| [`docs/apps/architecture.md`](../apps/architecture.md) | Arquitectura de `Front/` y `Back/`, manejo de imágenes, autenticación y cómo extender |
| [`docs/apps/como-funciona.md`](../apps/como-funciona.md) | Explicación en lenguaje sencillo: piezas, endpoints, modelo de datos, login y dos flujos completos de punta a punta |
| [`docs/apps/como-correr.md`](../apps/como-correr.md) | Guía paso a paso de ejecución local, con solución de problemas comunes |
| [`docs/apps/despliegue.md`](../apps/despliegue.md) | Publicación gratuita en Render + Neon, en 5 pasos, con problemas comunes |
| [`CLAUDE.md`](../../CLAUDE.md) | Convenciones vigentes del repositorio: comandos, arquitectura, reglas de negocio y despliegue |

### Código entregado

| Componente | Ruta | Descripción |
|---|---|---|
| Frontend | [`apps/Front/`](../../apps/Front) | React + TypeScript + Vite + Tailwind v4. Catálogo, carrito con QR, panel tipo hoja de cálculo, import/export CSV |
| Backend | [`apps/Back/`](../../apps/Back) | Fastify 5 + Prisma 6 + PostgreSQL 16. API bajo `/api`, JWT en cookie, imágenes en BYTEA |
| Esquema de datos | [`apps/Back/prisma/schema.prisma`](../../apps/Back/prisma/schema.prisma) | 6 modelos: `Categoria`, `Producto`, `Imagen`, `Pedido`, `LineaPedido`, `Usuario` |
| Migraciones | [`apps/Back/prisma/migrations/`](../../apps/Back/prisma/migrations) | `init`, `add_usuario_auth`, `add_imagenes_en_bd` |
| Semilla | [`apps/Back/prisma/seed.ts`](../../apps/Back/prisma/seed.ts) | 3 categorías, 12 productos y el usuario admin (idempotente) |
| Imagen de despliegue | [`Dockerfile`](../../Dockerfile) | Monolito multi-etapa: front + back en un solo servicio |

---

## 5. Trazabilidad completa del repositorio

### Ramas

| Rama | Estado | Contenido |
|---|---|---|
| `main` | HEAD en `65ac45c` | Monorepo + backend + **migración a Azure** fusionada por el PR #2 |
| `documentacion` | HEAD en `b27b236` · rama activa | Monorepo + backend + objetivos SMART + **monolito Docker/Render** |
| `feature/migracion-azure` | HEAD en `e09e9d5` | Soporte de Azure Blob Storage y preparación de la plataforma |
| `origin/HEAD` | → `origin/main` | — |

**Punto de divergencia:** `6fba7f3` (23-08-2026). Desde ahí, `main` siguió la vía Azure y `documentacion` la vía monolito. Diferencia actual: 44 archivos, 1.280 inserciones y 1.996 borrados.

### Historial completo — 11 commits

> La columna **Autor** es la cuenta de Git que ejecutó el commit, no siempre el autor del contenido: el material de investigación y los objetivos SMART son de **Sergio Rey**, y entraron al repositorio por los commits `df3f610` y `fc10f9b` que ejecutó Stiven.

| # | Fecha y hora | Hash | Autor | Mensaje | Volumen |
|---|---|---|---|---|---|
| 1 | 16-08 19:41 | `6383298` | Brian Perez | `chore: initial repository setup` | 1 archivo |
| 2 | 16-08 21:52 | `fea63df` | Brian Perez | `fase 1 proyecto` | 20 archivos · +3.016 |
| 3 | 16-08 22:03 | `6b36816` | Brian Perez | `Datos importantes` | 2 archivos · +277 |
| 4 | 20-08 13:45 | `df3f610` | stivenmelo | `Añadir la documentación inicial del proyecto Sanddy Almacén` | 5 archivos · +950 |
| 5 | 23-08 14:34 | `6fba7f3` | stivenmelo | `feat: reestructurar proyecto en monorepo (apps/Front y apps/Back) con backend completo` | 60+ archivos |
| 6 | 23-08 18:21 | `6db8d28` | Brian Pérez | **Merge PR #1** `documentacion` → `main` | — |
| 7 | 23-08 20:03 | `dea3323` | Brian Perez | `feat(storage): soportar Azure Blob Storage con fallback a disco local` | 5 archivos · +93 / −71 |
| 8 | 23-08 20:05 | `e09e9d5` | Brian Perez | `feat: preparar plataforma para migracion a Azure` | 18 archivos · +1.794 / −311 |
| 9 | 23-08 20:07 | `65ac45c` | Brian Pérez | **Merge PR #2** `feature/migracion-azure` → `main` | 23 archivos |
| 10 | 01-09 19:21 | `fc10f9b` | stivenmelo | `feat: añadir documento de formulación de objetivos utilizando metodología SMART` | 1 archivo · +163 |
| 11 | 04-09 23:40 | `b27b236` | stivenmelo | `feat: despliegue monolito (Docker + API bajo /api)` | 30 archivos · +788 / −162 |

### Distribución de la actividad por semana

| Semana | Días | Commits | Actividad |
|---|---|---|---|
| **Semana 1** | 16-08 → 23-08 | **9** | Arranque, investigación UX, MVP completo, dos PR fusionados |
| **Semana 2** | 24-08 → 31-08 | **0** | Sin actividad versionada — ver [Entrada 06](#entrada-06--24-08-al-31-08-2026--semana-sin-commits-análisis-y-bloqueo) |
| **Semana 3** | 01-09 → 06-09 | **2** | Objetivos SMART, monolito de despliegue, auditoría y diario |

---

## 6. Reflexión crítica del periodo

### Lo que funcionó

**1. Decidir contra el propio plan cuando el plan estaba equivocado.** El roadmap congelaba Next.js + Cosmos DB + Zustand + Zod. Al construir el modelo de datos quedó claro que las relaciones eran reales (pedido → líneas → producto → categoría) y que Cosmos DB obligaba a rehacer el modelo sin ganar nada. Se eligió PostgreSQL. Lo mismo con Next.js: el SEO no aporta cuando el tráfico entra por un enlace de WhatsApp. Sostener el plan por coherencia formal habría producido un proyecto peor.

**2. Documentar las decisiones con su razón, no sólo su resultado.** El repositorio no dice "usamos Postgres"; dice por qué se abandonó Cosmos DB. No dice "SVG no está permitido"; dice que es XML, que puede llevar un `<script>` y que se serviría desde el mismo origen que la API. Esa diferencia es la que hace que la documentación siga siendo útil seis meses después.

**3. Declarar los supuestos en lugar de ocultarlos.** Los cinco supuestos del documento SMART y el riesgo de la base pequeña en el canvas son admisiones voluntarias de debilidad. Cuestan puntos en la primera lectura y ganan credibilidad en la segunda.

**4. Trabajo por ramas con revisión cruzada.** Dos PR fusionados por el integrante que no escribió el código, cero *commits* directos a `main` durante la fase de integración.

### Lo que falló

**1. La desincronización plan ↔ código, cuatro veces.** El 16-08 dos documentos escritos con 11 minutos de diferencia apuntaban a nubes distintas. El 23-08 el código contradijo al roadmap y el roadmap no se actualizó ese día. El 01-09 el equipo tuvo que **documentar formalmente** que tres de sus propios documentos se contradecían. El 06-09 hay dos ramas con dos arquitecturas incompatibles. Es el patrón dominante del periodo.

**2. Construir para un destino de despliegue sin haberlo validado.** El 23-08 se construyeron más de 1.000 líneas de código y documentación para Azure con front y backend en dominios distintos. Doce días después se descubrió que **esa topología impide iniciar sesión en el panel**, porque la cookie `SameSite=Lax` se vuelve cookie de terceros. El trabajo no fue inútil, pero fue evitable: bastaba con verificar el mecanismo de sesión contra la topología **antes** de construir.

**3. Una semana sin rastro.** Nueve días sin commits, con trabajo de análisis real detrás que sólo se materializó al final. El trabajo intelectual que no se versiona incrementalmente es indistinguible del trabajo que no se hizo.

**4. Cero pruebas automatizadas.** El plan de fases dedica la Fase 9 al *testing*, y no se ejecutó. `apps/Front/tests/` y `docs/apps/front-tests.md` son *placeholders*. Cada refactor —y hubo dos grandes— se validó a ojo. La única verificación disponible hoy es que `npm run build` compile.

**5. Se prometió validar y aún no se ha validado.** El canvas define 9 experimentos con umbrales; el objetivo específico 4 compromete un piloto de 20–30 productos reales, pruebas de usabilidad con 5 clientes y una prueba de carga con la administradora. **Nada de eso se ha ejecutado todavía.** H1–H5 siguen siendo hipótesis en el sentido estricto: ni confirmadas ni refutadas.

### Las tres lecciones que quedan

| # | Lección | Regla adoptada |
|---|---|---|
| 1 | Un plan que el código contradice y que nadie corrige no es un plan: es desinformación activa | **Ningún PR que toque arquitectura se fusiona sin actualizar el documento que la describe** |
| 2 | Las restricciones del navegador (cookies, orígenes, CORS) son restricciones de arquitectura, no detalles de implementación | **La topología de despliegue se valida contra el mecanismo de sesión antes de construir para ella** |
| 3 | El trabajo sin evidencia incremental es invisible, y la evidencia también es entregable | **Commitear borradores y notas de análisis, no sólo documentos terminados** |

---

## 7. Estado del producto y próximos pasos

### Qué está construido y funcionando

- ✅ **RF1–RF9 completos**: autenticación de admin, CRUD de productos y categorías, vista tipo hoja de cálculo con import/export CSV, catálogo público sin registro, buscador y filtros, ficha de producto, carrito de interés y generación de pedido `SA-XXXX` con QR y enlace de WhatsApp.
- ✅ **Seguridad base**: bcrypt, JWT firmado en cookie `httpOnly`/`SameSite=Lax` de 8 horas, separación estricta entre rutas públicas y protegidas por `requireAuth`, validación de tipo y tamaño en la subida de imágenes con SVG excluido.
- ✅ **Empaquetado desplegable**: `Dockerfile` monolito multi-etapa, migraciones aplicadas al arrancar el contenedor, guía completa de publicación en Render + Neon dentro del presupuesto de $30.000 COP/mes.
- ✅ **Documentación técnica** de arquitectura, funcionamiento, ejecución local y despliegue.

### Pendientes, por prioridad

| Prioridad | Pendiente | Por qué importa |
|---|---|---|
| 🔴 **Bloqueante** | Rellenar `WHATSAPP_NUMBER` en `Front/src/components/WhatsAppButton.tsx` (hoy `'NUMERO_PLACEHOLDER'`) | Sin esto, el botón flotante y el cierre del carrito llevan a una dirección rota: el flujo de negocio completo queda inutilizado |
| 🔴 **Bloqueante** | Restaurar `apps/Back/docker-compose.yml` (borrado en el árbol de trabajo, aún presente en `HEAD`) | Sin él, `docker compose up -d db` no funciona y `como-correr.md` describe un flujo inejecutable |
| 🟠 **Alto** | Integrar `documentacion` en `main` y decidir el destino de la migración a Azure | Dos ramas con dos arquitecturas incompatibles; `main` no tiene el trabajo de despliegue más reciente |
| 🟠 **Alto** | Desplegar de verdad en Render + Neon y verificar los 4 pasos de comprobación de `despliegue.md` | El objetivo específico 4 exige *"la plataforma desplegada en producción"*; hoy sólo está el empaquetado |
| 🟠 **Alto** | Ejecutar los experimentos del box 08 del canvas | H1–H5 siguen sin validar: el ciclo Lean UX está incompleto sin la fase de medición |
| 🟡 **Medio** | Implementar la Fase 9 del plan (*testing*) y ESLint en ambas apps | Dos refactors grandes se validaron sin red de seguridad |
| 🟡 **Medio** | Corregir `README.md` raíz (scripts inexistentes) y `como-correr.md` (`VITE_API_URL` ahora es `/api`) | Documentación que contradice el código en vigor |
| 🟢 **Bajo** | *Rate limiting* en el login | Limitación conocida y documentada en `routes/auth.ts` |
| 🟢 **Bajo** | Rutina de limpieza de imágenes huérfanas | Deuda documentada, con la consulta SQL ya escrita en `architecture.md` |

### Cierre de la iteración 1

El **objetivo específico 3** (Construir) está cumplido: los 9 requerimientos funcionales están implementados y verificados con `npm run build` en ambas apps. Los objetivos **1** (Caracterizar) y **2** (Diseñar) están cumplidos y documentados. El objetivo **4** (Validar) es el trabajo de la iteración 2: **desplegar, medir y refutar o confirmar H1–H5**.

---

## 8. Autoevaluación frente a la rúbrica

| Criterio | Autoevaluación | Sustento |
|---|---|---|
| **1. Consistencia y frecuencia de las entradas** (2 pts) | **Competente**, no destacado | 9 entradas cubren las 3 semanas del periodo, con actualizaciones detalladas en las semanas 1 y 3. La **semana 2 no tuvo actividad versionada** y está registrada como tal en lugar de rellenarse. Reconocer el hueco es más honesto que ocultarlo, pero el hueco existe |
| **2. Detalle y claridad de las entradas** (3 pts) | **Destacado** | Cada entrada trae objetivos, actividades, logros, desafíos, soluciones, reflexión y evidencia con *hash* de commit. Se citan archivos, líneas, migraciones y decisiones concretas, no generalidades |
| **3. Reflexión crítica** (4 pts) | **Destacado** | Se identifican por nombre cinco fallos propios —desincronización plan/código repetida cuatro veces, más de 1.000 líneas construidas para una topología inviable, una semana sin rastro, cero pruebas y validación prometida no ejecutada— y de cada uno se deriva una regla concreta de trabajo |
| **4. Aporte al proyecto final** (6 pts) | **Destacado** | El periodo entrega el MVP funcional completo (RF1–RF9), 6 modelos de datos, 3 migraciones, autenticación real, imagen Docker desplegable y 13 documentos entre investigación, planificación y documentación técnica. **Los tres frentes son identificables y trazables**: Sergio (problema, cliente y documentación) entrega los requerimientos y las métricas que rigen el proyecto; Brian (nube) entrega la infraestructura y la estrategia de despliegue; Stiven (desarrollo y despliegue) entrega la aplicación funcionando y publicable |

---

*Diario de Trabajo — Grupo Sanddy Almacén · Proyecto final trend+tech · Universidad EAN*
*Sergio Alejandro Rey Mateus · Brian David Pérez Herrera · Stiven Daniel Melo Guayazán*
*Actualizado el 06-09-2026 · Última evidencia registrada: commit `b27b236`*
