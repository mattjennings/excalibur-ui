import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'excalibur-ui',
      fileName: 'excalibur-ui',
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
