import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // NEW

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // NEW
  ],
})