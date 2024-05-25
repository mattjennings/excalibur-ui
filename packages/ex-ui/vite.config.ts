import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'ex-ui',
      fileName: 'ex-ui',
    },
    rollupOptions: {
      external: ['excalibur'],
      output: {
        globals: {
          excalibur: 'ex',
        },
      },
    },
  },
})
