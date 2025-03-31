const fs = require('fs-extra');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const { execSync } = require('child_process');
const rimraf = require('rimraf');
const prettier = require('prettier');

const { argv } = require('yargs');

const { log } = require('./utils/log.cjs');
const { getFile } = require('./utils/getFile.cjs');
const { throwError } = require('./utils/throwError.cjs');
const { zip } = require('./utils/zip.cjs');

const { dry } = argv;

(async () => {
  log.warning('Beta release script');

  if (!dry) {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString('utf-8');
    if (currentBranch.trim() !== 'develop') {
      throwError("Beta releases should be created from 'develop' branch");
    }
  } else {
    log.warning('Dry mode activated, branch will not be checked');
  }

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

  await zip('dist', `package/${systemFile.id}-beta.zip`);

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

  rimraf.sync('package');
  rimraf.sync('dist');

  log.success('Beta release process completed!');
})();

function incrementBetaVersion(version) {
  let [major, minor, patch] = version.split('.');
  if (patch.includes('-beta')) {
    let [basePatch, betaNum] = patch.split('-beta');
    betaNum = parseInt(betaNum) + 1;
    patch = `${basePatch}-beta${betaNum}`;
  } else {
    patch = `${patch}-beta1`;
  }
  return `${major}.${minor}.${patch}`;
}
