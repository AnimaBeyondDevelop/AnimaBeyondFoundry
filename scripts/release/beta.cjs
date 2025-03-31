const fs = require('fs-extra');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const { execSync } = require('child_process');
const rimraf = require('rimraf');
const prettier = require('prettier');

const { argv } = require('yargs');

const { log } = require('./utils/log.cjs');
const { getFile } = require('./utils/getFile.cjs');
const { zip } = require('./utils/zip.cjs');

const { dry } = argv;

(async () => {
  log.warning('Beta release script');

  log.info('Reading configuration files...');

  const packageJson = getFile('package.json');
  const systemFile = getFile('src/system.json');

  const newVersion = readlineSync.question(
    chalk.magenta(
      `Current version in package.json is ${packageJson.version}. ` +
        'Enter new beta version (leave blank to auto-increment): '
    )
  );

  packageJson.version = newVersion || incrementBetaVersion(packageJson.version);
  const prettiedPackageJson = prettier.format(JSON.stringify(packageJson), {
    filepath: 'package.json'
  });

  fs.writeFileSync('package.json', prettiedPackageJson, 'utf8');

  log.info('Updating system.json file...');

  systemFile.version = packageJson.version;
  const prettiedSystemFile = prettier.format(JSON.stringify(systemFile), {
    filepath: 'src/system.json'
  });

  fs.writeFileSync('src/system.json', prettiedSystemFile, 'utf8');

  log.info('Committing changes...');

  if (!dry) {
    execSync('git add src/system.json package.json');
    execSync(`git commit -m "Beta release: v${systemFile.version}" -n`);
  } else {
    log.warning('Dry mode activated, no changes will be committed');
  }

  log.info('Building project...');

  execSync('npm run build:dev');
  log.success('Build completed.');

  log.info('Creating package folder...');

  rimraf.sync('package');
  fs.mkdirSync('package');

  await zip('dist', `package/${systemFile.id}_${systemFile.version}.zip`);

  log.success('Beta package created.');

  log.info('Pushing changes...');

  if (!dry) {
    execSync(
      `git tag -a beta-${systemFile.version} -m "Beta release: v${systemFile.version}"`
    );
    execSync('git push origin main --tags');
  } else {
    log.warning('Dry mode activated, no tags will be pushed');
  }

  log.info('Cleaning up files...');

  rimraf.sync('dist');

  log.success('Beta release process completed!');
})();

function incrementBetaVersion(version) {
  if (version.includes('-beta')) {
    let [basePatch, betaNum] = version.split('-beta');
    betaNum = parseInt(betaNum) + 1;
    return `${basePatch}-beta${betaNum}`;
  } else {
    return `${version}-beta1`;
  }
}
