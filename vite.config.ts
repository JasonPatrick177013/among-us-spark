import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Vercel auto-detects Vite: build command `npm run build`, output directory `dist`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
