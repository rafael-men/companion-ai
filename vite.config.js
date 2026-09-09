import { fileURLToPath, URL } from "node:url"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: 'electron/main.cjs',
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: false,
            lib: false,
            rolldownOptions: {
              input: 'electron/main.cjs',
              output: {
                format: 'cjs',
                entryFileNames: '[name].cjs',
                chunkFileNames: '[name].cjs',
                assetFileNames: '[name].[ext]',
              },
            },
          },
        },
      },
      {
        entry: 'electron/preload.cjs',
        onstart(args) { args.reload() },
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: false,
            lib: false,
            rolldownOptions: {
              input: 'electron/preload.cjs',
              output: {
                format: 'cjs',
                entryFileNames: '[name].cjs',
                chunkFileNames: '[name].cjs',
                assetFileNames: '[name].[ext]',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
