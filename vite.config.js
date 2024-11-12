import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@svelte': path.resolve(__dirname, './src/svelte'),
      '@module': path.resolve(__dirname, './src/module'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@scss': path.resolve(__dirname, './src/scss'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      name: 'animabf',
      entry: 'src/animabf.mjs',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: ({ name: fileName }) => {
          return `${fileName}.js`;
        },
        assetFileNames: 'animabf.[ext]'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: ['src/scss'],
        additionalData: `@use 'variable.scss' as *;`
      }
    }
  },
  plugins: [
    svelte(),
    copy({
      targets: [
        { src: 'src/assets', dest: 'dist' },
        { src: 'src/lang', dest: 'dist' },
        { src: 'packs', dest: 'dist' },
        { src: 'src/templates', dest: 'dist' },
        { src: 'src/system.json', dest: 'dist' },
        { src: 'src/template.json', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ]
});
