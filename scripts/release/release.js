const fs = require('fs-extra');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const { execSync } = require('child_process');
const rimraf = require('rimraf');
const prettier = require('prettier');

const { argv } = require('yargs');

const { log } = require('./utils/log');
const { getFile } = require('./utils/getFile');
const { throwError } = require('./utils/throwError');
const { zip } = require('./utils/zip');

const { dry } = argv;

(async () => {
  log.warning('Release script');

  if (!dry) {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString('utf-8');

    if (currentBranch.trim() !== 'main') {
      throwError("Publishing only can be done 'main' branch");
    }
  } else {
    log.warning('Dry mode activated, branch will not be checked');
  }

  log.info('Reading configuration files...');

  const packageJson = getFile('package.json');
  const systemFile = getFile('src/system.json');

  const { rawURL, repository: repoURL } = getFile('distributionconfig.json');
  if (!rawURL || !repoURL) {
    throwError('Repository URLs not configured in distributionconfig.json');
  }

  readlineSync.question(
    chalk.magenta(
      `Do you want to publish a new version? New version will be ${packageJson.version}, so make sure that this version is not already published :`
    )
  );

  log.info('Updating system.json file...');

  systemFile.version = packageJson.version;
  systemFile.url = repoURL;
  systemFile.manifest = `${rawURL}/main/src/system.json`;
  systemFile.changelog = `${repoURL}/releases/tag/v${systemFile.version}`;
  systemFile.download = `${repoURL}/releases/download/v${systemFile.version}/${systemFile.id}.zip`;

  const prettiedSystemFile = prettier.format(JSON.stringify(systemFile), { parser: 'json' });

  fs.writeFileSync('src/system.json', prettiedSystemFile, 'utf8');

  log.info('Commiting changes...');

  if (!dry) {
    execSync('git add src/system.json');

    execSync(`git commit -m "update: v${systemFile.version}" -n`);
  } else {
    log.warning('Dry mode activated, no changes will be commited');
  }

  log.info('Build started...');

  execSync('npm run build:prod');

  log.success('Build finished...');

  log.info('Creating package folder...');

  rimraf.sync('package');
  fs.mkdirSync('package');

  await zip('dist', `package/${systemFile.id}.zip`);

  log.success('Package created...');

  log.info('Pushing changes...');

  if (!dry) {
    execSync(`git tag -a v${systemFile.version} -m "Updated to v${systemFile.version}"`);

    execSync('git push origin main --tags');
  } else {
    log.warning('Dry mode activated, no tags will be pushed');
  }

  readlineSync.question(
    chalk.blue(
      `Wait until create new release, click here to access directly: https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/releases/new?title=v${systemFile.version}&tag=v${systemFile.version}\n\nRemember to upload de package ${systemFile.id}.zip allocated in package folder`
    )
  );

  log.info('Cleaning files...');

  rimraf.sync('package');
  rimraf.sync('dist');

  log.success('Done!');
})();
