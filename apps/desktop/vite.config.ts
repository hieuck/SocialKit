import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/renderer',
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@socialkit/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@socialkit/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@socialkit/cli': resolve(__dirname, '../../packages/cli/src/index.ts'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
