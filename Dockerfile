# syntax=docker/dockerfile:1

# Imagen monolito: un solo proceso sirve la API bajo /api y, en la misma URL, el build
# del front. Un solo origen es lo que permite que la cookie de sesión (SameSite=Lax)
# funcione sin convertirla en cookie de terceros.
#
# Se construye desde la raíz del repo, porque necesita las dos apps:
#   docker build -t sanddy .

# ---------- 1. Build del front ----------
FROM node:22-bookworm-slim AS front-build
WORKDIR /app/Front
COPY apps/Front/package.json apps/Front/package-lock.json ./
RUN npm ci
COPY apps/Front/ ./
# Vite congela esta variable dentro del bundle en tiempo de build: el navegador pedirá
# /api contra su propio origen, que es este mismo servidor.
ENV VITE_API_URL=/api
RUN npm run build

# ---------- 2. Build del back ----------
FROM node:22-bookworm-slim AS back-build
WORKDIR /app/Back
COPY apps/Back/package.json apps/Back/package-lock.json ./
RUN npm ci
COPY apps/Back/ ./
RUN npx prisma generate && npm run build

# ---------- 3. Imagen final ----------
FROM node:22-bookworm-slim AS runtime
# Prisma necesita openssl para abrir la conexión TLS con Postgres.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app/Back

# Solo dependencias de producción. `prisma` está entre ellas a propósito: el contenedor
# corre `prisma migrate deploy` al arrancar y necesita el CLI disponible.
COPY apps/Back/package.json apps/Back/package-lock.json ./
RUN npm ci --omit=dev

COPY apps/Back/prisma ./prisma
RUN npx prisma generate

COPY --from=back-build /app/Back/dist ./dist
# Misma disposición Back/ + Front/ que en el repo, para que el FRONTEND_DIST por defecto
# (../Front/dist) siga siendo válido sin configurar nada.
COPY --from=front-build /app/Front/dist /app/Front/dist

# Informativo: en Render manda la variable PORT y el servidor la lee de ahí.
EXPOSE 3001

# `migrate deploy` solo aplica las migraciones ya escritas en prisma/migrations. A
# diferencia de `migrate dev`, nunca genera migraciones nuevas ni resetea la base.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
