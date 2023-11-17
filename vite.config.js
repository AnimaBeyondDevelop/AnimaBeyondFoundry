import { defineConfig } from 'vite'
import copy from "rollup-plugin-copy";
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // sourcemap: true,
    minify: false,
    lib: {
      name: 'animabf',
      entry: 'src/animabf.mjs',
      formats: ['es'],
      // fileName: 'animabf'
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: ({ name: fileName }) => {
          return `${fileName}.js`
        },
        assetFileNames: 'animabf.[ext]'
      }
    }
  },
  plugins: [
    svelte(),
    copy({
      targets: [
        { src: "src/assets", dest: "dist" },
        { src: "src/lang", dest: "dist" },
        { src: "src/packs", dest: "dist" },
        { src: "src/templates", dest: "dist" },
        { src: "src/system.json", dest: "dist" },
        { src: "src/template.json", dest: "dist" }
      ],
      hook: "writeBundle",
    })
  ],
})
