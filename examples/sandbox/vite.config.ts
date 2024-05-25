import { defineConfig } from 'vite'
import { default as AutoImport } from 'unplugin-auto-import/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  optimizeDeps: {
    // only necessary if running local build of ex-ui. if installed from npm, remove this
    exclude: ['ex-ui'],
  },
  plugins: [
    // automatically expose global 'ex' variable that will compile into
    // import { XYZ } from 'excalibur' for tree shaking
    AutoImport({
      imports: [
        {
          excalibur: [['*', 'ex']],
        },
      ],
      dts: './src/ex.d.ts',
    }),
    solidPlugin({
      solid: {
        moduleName: 'ex-ui',
        generate: 'universal',
      },
    }),
  ],
})
