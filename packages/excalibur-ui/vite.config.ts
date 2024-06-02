import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: [
        resolve(__dirname, 'src/index.tsx'),
        resolve(__dirname, 'src/runtime.tsx'),
      ],
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['excalibur', 'solid-js'],
      output: {
        globals: {
          excalibur: 'ex',
        },
      },
    },
  },
})
