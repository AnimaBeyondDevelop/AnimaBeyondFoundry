const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const archiver = require('archiver');
const stringify = require('json-stringify-pretty-compact');
const typescript = require('typescript');
const through = require('through2');
const prettier = require('prettier');
const { execSync } = require('child_process');

const readlineSync = require('readline-sync');

const ts = require('gulp-typescript');
const less = require('gulp-less');
const sass = require('gulp-sass');
const git = require('gulp-git');
const rimraf = require('rimraf');

const rimrafAsync = path => new Promise(resolve => rimraf(path, resolve));

const argv = require('yargs').argv;

sass.compiler = require('sass');

function getConfig() {
  const configPath = path.resolve(process.cwd(), 'foundryconfig.json');

  let config;
  if (fs.existsSync(configPath)) {
    config = fs.readJSONSync(configPath);
    return config;
  } else {
    return;
  }
}

function getDistConfig() {
  const distPath = path.resolve(process.cwd(), 'distributionconfig.json');

  if (fs.pathExistsSync(distPath)) {
    return fs.readJsonSync(distPath);
  }
}

let ROOT_PATH;

if (argv.release) {
  ROOT_PATH = `dist/`;
} else {
  ROOT_PATH = `${getConfig().destPath ?? '..'}/animabf`;
  if (argv.develop) {
    ROOT_PATH += '-dev';
  }
}

function getManifest() {
  const json = {};

  if (fs.existsSync('src')) {
    json.root = 'src';
  } else {
    json.root = ROOT_PATH;
  }

  const modulePath = path.join(json.root, 'module.json');
  const systemPath = path.join(json.root, 'system.json');

  if (fs.existsSync(modulePath)) {
    json.file = fs.readJSONSync(modulePath);
    json.name = 'module.json';
  } else if (fs.existsSync(systemPath)) {
    json.file = fs.readJSONSync(systemPath);
    json.name = 'system.json';
  } else {
    return;
  }

  return json;
}

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

const tsConfig = ts.createProject('tsconfig.json', {
  getCustomTransformers: _program => ({
    after: [createTransformer()]
  })
});

/********************/
/*		BUILD		*/
/********************/

/**
 * Build TypeScript
 */
function buildTS() {
  return gulp.src('src/**/*.ts').pipe(tsConfig()).pipe(gulp.dest(ROOT_PATH));
}

/**
 * Build CharacterTemplate
 */
function buildTemplate() {
  return gulp.src('src/module/types/Actor.ts').pipe(
    through.obj((file, enc, cb) => {
      const originalContent = file.contents;

      try {
        const content = Buffer.from(file.contents).toString();

        let typedCharacteristics = content.substr(content.indexOf('{'), content.lastIndexOf('}'));

        typedCharacteristics = typedCharacteristics.replace(/;}/g, '}');
        typedCharacteristics = typedCharacteristics.replace(/;/g, ',');
        typedCharacteristics = typedCharacteristics.replace(/number/g, '0');
        typedCharacteristics = typedCharacteristics.replace(/string/g, "''");
        typedCharacteristics = typedCharacteristics.replace(/boolean/g, 'false');
        typedCharacteristics = typedCharacteristics.substr(0, typedCharacteristics.lastIndexOf(','));
        typedCharacteristics = prettier.format(typedCharacteristics, { parser: 'json' });

        file.contents = Buffer.from(typedCharacteristics);

        const templatePath = 'src/template.json';

        const template = fs.readJSONSync(templatePath);

        template.Actor.character = JSON.parse(typedCharacteristics);

        fs.writeJsonSync(templatePath, template);

        execSync('prettier src/template.json --write');
      } catch (e) {
        console.log(chalk.blueBright('Restoring original template.json content due the following fail:'));
        console.error(chalk.red(e.stack));
        file.contents = originalContent;
      }

      cb(null, file);
    })
  );
}

/**
 * Build Less
 */
function buildLess() {
  return gulp.src('src/*.less').pipe(less()).pipe(gulp.dest(ROOT_PATH));
}

/**
 * Build SASS
 */
function buildSASS() {
  return gulp.src('src/scss/animabf.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest(ROOT_PATH));
}

/**
 * Copy static files
 */
async function copyFiles() {
  const statics = ['lang', 'fonts', 'assets', 'templates', 'packs', 'module.json', 'template.json'];
  if (argv.develop){
    statics.push('system.development.json')
  } else {
    statics.push('system.json')
  }
  try {
    for (const file of statics) {
      if (fs.existsSync(path.join('src', file))) {
        await fs.copy(path.join('src', file), path.join(ROOT_PATH, file));
        if (file === 'system.development.json') {
          await fs.rename(path.join(ROOT_PATH, file), path.join(ROOT_PATH, 'system.json'))
        }
      }
    }
    return Promise.resolve();
  } catch (err) {
    Promise.reject(err);
  }
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  gulp.watch('src/**/*.ts', { ignoreInitial: false }, buildTS);
  gulp.watch('src/module/types/Actor.ts', { ignoreInitial: false }, buildTemplate);
  gulp.watch('src/**/*.less', { ignoreInitial: false }, buildLess);
  gulp.watch('src/**/*.scss', { ignoreInitial: false }, buildSASS);
  gulp.watch(
    ['src/fonts', 'src/lang', 'src/templates', 'src/packs', 'src/*.json'],
    { ignoreInitial: false },
    copyFiles
  );
}

/********************/
/*		CLEAN		*/
/********************/

/**
 * Remove built files from `dist` folder
 * while ignoring source files
 */
async function clean(cb) {
  Promise.all([rimrafAsync(ROOT_PATH), rimrafAsync('./package'), rimrafAsync('./dist')]).then(cb);
}

/*********************/
/*		PACKAGE		 */
/*********************/

/**
 * Package build
 */
async function packageBuild() {
  const manifest = getManifest();

  return new Promise((resolve, reject) => {
    try {
      // Remove the package dir without doing anything else
      if (argv.clean || argv.c) {
        console.log(chalk.yellow('Removing all packaged files'));
        fs.removeSync('package');
        return;
      }

      // Ensure there is a directory to hold all the packaged versions
      fs.ensureDirSync('package');

      // Initialize the zip file
      const zipName = `${manifest.file.name}.zip`;
      const zipFile = fs.createWriteStream(path.join('package', zipName));
      const zip = archiver('zip', { zlib: { level: 9 } });

      zipFile.on('close', () => {
        console.log(chalk.green(zip.pointer() + ' total bytes'));
        console.log(chalk.green(`Zip file ${zipName} has been written`));
        return resolve();
      });

      zip.on('error', err => {
        throw err;
      });

      zip.pipe(zipFile);

      // Add the directory with the final code
      zip.directory('dist/', manifest.file.name);

      zip.finalize();
    } catch (err) {
      return reject(err);
    }
  });
}

/*********************/
/*		PACKAGE		 */
/*********************/

/**
 * Update version and URLs in the manifest JSON
 */
function updateManifest(cb) {
  const packageJson = fs.readJSONSync('package.json');
  const config = getDistConfig(),
    manifest = getManifest(),
    rawURL = config.rawURL,
    repoURL = config.repository,
    manifestRoot = manifest.root;

  if (!config) cb(Error(chalk.red('distributionconfig.json not found')));
  if (!manifest) cb(Error(chalk.red('Manifest JSON not found')));
  if (!rawURL || !repoURL) cb(Error(chalk.red('Repository URLs not configured in distributionconfig.json')));

  try {
    manifest.file.version = packageJson.version;

    /* Update URLs */

    const result = `${repoURL}/releases/download/v${manifest.file.version}/${manifest.file.name}.zip`;

    manifest.file.url = repoURL;
    manifest.file.manifest = `${rawURL}/main/${manifestRoot}/${manifest.name}`;
    manifest.file.changelog = `${repoURL}/releases/tag/v${manifest.file.version}`;
    manifest.file.download = result;

    const prettyProjectJson = prettier.format(stringify(manifest.file), { parser: 'json' });

    fs.writeFileSync(path.join(manifest.root, manifest.name), prettyProjectJson, 'utf8');

    return cb();
  } catch (err) {
    cb(err);
  }
}

function gitCommit() {
  return gulp.src('./*').pipe(
    git.commit(`update: v${getManifest().file.version}`, {
      args: '-a --no-verify',
      disableAppendPaths: true
    })
  );
}

function ensureNewVersion(cb) {
  const packageJson = fs.readJSONSync('package.json');
  const manifest = getManifest();

  if (manifest.file.version === packageJson.version) {
    cb(
      Error(
        chalk.red(
          `Error: package.json version is the same as the manifest: ${packageJson.version}. Update it in the package.json and retry again.`
        )
      )
    );
  } else {
    cb();
  }
}

function ensureGitBranch(cb) {
  git.revParse({ args: '--abbrev-ref HEAD' }, function (err, branch) {
    if (branch !== 'main') {
      cb(new Error(chalk.red("Publishing only can be done 'main' branch")));
    } else {
      cb();
    }
  });
}

function gitTag(cb) {
  const manifest = getManifest();
  return git.tag(`v${manifest.file.version}`, `Updated to ${manifest.file.version}`, err => {
    if (err) cb(err);
  });
}

function gitPushTagsAndCreateRelease(cb) {
  const manifest = getManifest();

  git.push('origin', `v${manifest.file.version}`, { args: ' --tags' }, function (err) {
    if (!err) {
      readlineSync.question(
        chalk.blue(
          `Wait until create new release, click here to access directly: https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/releases/new?title=v${manifest.file.version}&tag=v${manifest.file.version}\n\nRemember to upload de package ${manifest.file.name}.zip allocated in package folder`
        )
      );

      cb();
    } else {
      throw cb(err);
    }
  });
}

function gitPush(cb) {
  git.push('origin', 'main', { args: ' --tags' }, function (err) {
    if (!err) {
      cb();
    } else {
      throw cb(err);
    }
  });
}

function showDisclaimer(cb) {
  const packageJson = fs.readJSONSync('package.json');

  readlineSync.question(
    chalk.magenta(
      `Do you want to publish a new version? New version will be ${packageJson.version}, so make sure that this version is not already published :`
    )
  );

  cb();
}

const execBuild = gulp.parallel(buildTS, buildLess, buildSASS, copyFiles);

exports.build = gulp.series(clean, execBuild);
exports.watch = buildWatch;
exports.clean = clean;
exports.package = gulp.series(clean, execBuild, packageBuild);
exports.update = updateManifest;
exports.publish = gulp.series(
  ensureGitBranch,
  ensureNewVersion,
  showDisclaimer,
  updateManifest,
  gitCommit,
  clean,
  execBuild,
  packageBuild,
  gitTag,
  gitPushTagsAndCreateRelease,
  clean,
  gitPush
);
