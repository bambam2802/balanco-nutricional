/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  // Build em arquivo único (dist/index.html) para abrir direto do disco na feira, sem servidor.
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
