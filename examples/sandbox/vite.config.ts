import { defineConfig } from 'vite'
import { default as AutoImport } from 'unplugin-auto-import/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  base: process.env.CI ? 'excalibur-ui' : '',

  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
    force: true,
  },
  resolve: {
    dedupe: ['solid-js', 'excalibur-ui'],
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
        moduleName: 'excalibur-ui',
        generate: 'universal',
      },
    }),
    // force full page reload on any change. HMR does not work with JSX
    {
      name: 'full-reload',
      handleHotUpdate({ server }) {
        server.ws.send({ type: 'full-reload' })
        return []
      },
    },
  ],
})
