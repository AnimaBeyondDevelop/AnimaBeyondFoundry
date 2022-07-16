import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
// import livereload from "rollup-plugin-livereload";
// import { terser } from "rollup-plugin-terser";
// import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy-watch";

import sveltePreprocess from 'svelte-preprocess';
import typescript_rollup from '@rollup/plugin-typescript';

import typescript from 'typescript';
import path from 'path';

const production = false//!process.env.ROLLUP_WATCH;

/**
 * TypeScript transformers
 * @returns {typescript.TransformerFactory<typescript.SourceFile>}
 */
function createTransformer() {
  /**
   * @param {typescript.Node} node
   */
  function shouldMutateModuleSpecifier(node) {
    if (!typescript.isImportDeclaration(node) && !typescript.isExportDeclaration(node)) return false;
    if (node.moduleSpecifier === undefined) return false;
    if (!typescript.isStringLiteral(node.moduleSpecifier)) return false;
    if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../')) return false;
    if (path.extname(node.moduleSpecifier.text) !== '') return false;
    return true;
  }

  /**
   * Transforms import/export declarations to append `.js` extension
   * @param {typescript.TransformationContext} context
   */
  function importTransformer(context) {
    return node => {
      /**
       * @param {typescript.Node} node
       */
      function visitor(node) {
        if (shouldMutateModuleSpecifier(node)) {
          if (typescript.isImportDeclaration(node)) {
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`);
            return typescript.updateImportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.importClause,
              newModuleSpecifier
            );
          } else if (typescript.isExportDeclaration(node)) {
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`);
            return typescript.updateExportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.exportClause,
              newModuleSpecifier
            );
          }
        }
        return typescript.visitEachChild(node, visitor, context);
      }

      return typescript.visitNode(node, visitor);
    };
  }

  return importTransformer;
}

export default {
  input: "src/animabf.ts",
  output: {
    // sourcemap: !production && true,
    format: "es",
    name: "app",
    dir: "dist/animabf",
    preserveModules: true,
    preserveModulesRoot: "src"
    // file: "dist/main.js",
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({}),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        // enableSourcemap: !production,
        // accessors: true,
      },
      emitCss: false,
    }),
    typescript_rollup({
      // sourceMap: !production,
      // outDir: 'dist/animabf'
      transformers: {
        after: [createTransformer()]
      }
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    // css({ output: "main.css" }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    copy({
      targets: [{ src: ["./src/*", "!./**/*.ts", "!./src/module"], dest: "./dist/animabf" }],
      copyOnce: true,
      watch: !production && "./src",
      verbose: true,
    }),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    // !production && livereload("src"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    // production && terser({ mangle: false }),
  ],
  watch: {
    clearScreen: false,
  },
};
