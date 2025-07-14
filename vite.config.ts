import path from 'node:path'
import process from 'node:process'

import { defineConfig } from 'vite'

import packageJson from './package.json'

export default defineConfig({
  publicDir: false,
  build: {
    minify: false,
    sourcemap: true,
    commonjsOptions: {
      extensions: ['.js', '.mjs'],
      ignoreTryCatch: false,
      transformMixedEsModules: true,
    },
    lib: {
      entry: './src/extension.ts',
      formats: ['es'],
    },
    rollupOptions: {
      platform: 'node',
      output: {
        dir: path.resolve(import.meta.dirname, 'out'),
        format: 'es',
        preserveModules: true,
        entryFileNames(chunkInfo) {
          const filePath = path.resolve(chunkInfo.facadeModuleId!)
          const rootPath = path.resolve(process.cwd(), 'src')
          if (filePath.startsWith(rootPath)) {
            return `${filePath.replace(path.resolve(process.cwd(), 'src'), '').replace(/^\\|\.[^/.]+$/g, '')}.js`
          }
          return '[name].js'
        },
        preserveModulesRoot: 'src',
      },
      external: [
        'vscode',
        /^node:.*/,
        ...['assert', 'fs', 'fs/promises', 'os', 'path', 'process', 'tty', 'url', 'util', 'v8', 'module'],
        'typescript',
        ...Object.keys(packageJson.dependencies),
      ],
    },
    outDir: 'out',
  },
  plugins: [
  ],
})
