import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: [
        resolve(__dirname, 'src/index.tsx'),
        resolve(__dirname, 'src/jsx-runtime.tsx'),
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
    minify: false,
  },
  plugins: [dts()],
})
