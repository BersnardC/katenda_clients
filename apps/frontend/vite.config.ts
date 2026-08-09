import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const require = createRequire(import.meta.url)

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    // tslib CJS sets __esModule without exports.default; Rolldown SSR interop
    // then crashes on `__toESM(...).default.__extends`. Prefer the ESM build.
    // See https://github.com/nitrojs/nitro/issues/4113
    alias: {
      tslib: require.resolve('tslib/tslib.es6.mjs'),
    },
  },
  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          platform: 'node',
        },
      },
    },
    nitro: {
      build: {
        rolldownOptions: {
          platform: 'node',
        },
      },
    },
  },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      rolldownConfig: { platform: 'node' },
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: false,
      },
    }),
    viteReact(),
  ],
})

export default config
