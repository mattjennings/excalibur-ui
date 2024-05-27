import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'excalibur-ui',
      fileName: 'excalibur-ui',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['excalibur', 'solid-js', 'yoga-layout'],
      output: {
        globals: {
          excalibur: 'ex',
        },
      },
    },
  },
})
