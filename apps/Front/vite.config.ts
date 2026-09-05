import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // `VITE_API_URL=/api` (ver .env): así el navegador habla siempre con su propio origen
    // y el dev server reenvía al backend. Sin esto, los GET caen en el fallback del SPA
    // (200 con HTML) y los POST/PUT/DELETE dan 404 sin llegar nunca a Fastify.
    //
    // Sin `rewrite`: el backend ya monta toda la API bajo /api (ver Back/src/app.ts), así
    // que el prefijo tiene que llegarle tal cual, igual que en producción.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
