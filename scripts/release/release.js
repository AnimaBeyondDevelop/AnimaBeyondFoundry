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

  const newVersion = readlineSync.question(
    chalk.magenta(
      `Version number in package.json is ${packageJson.version}.` +
        'Leave this blank or specify a new one and press enter: '
    )
  );

  if (newVersion) {
    log.info('Updating package.json file...');
    packageJson.version = newVersion;
    const prettiedPackageJson = prettier.format(JSON.stringify(packageJson), {
      parser: 'json'
    });

    fs.writeFileSync('package.json', prettiedPackageJson, 'utf8');
  }

  log.info('Updating system.json file...');

  systemFile.version = packageJson.version;
  systemFile.url = repoURL;
  systemFile.manifest = `${rawURL}/main/src/system.json`;
  systemFile.changelog = `${repoURL}/releases/tag/v${systemFile.version}`;
  systemFile.download = `${repoURL}/releases/download/v${systemFile.version}/${systemFile.id}.zip`;

  const prettiedSystemFile = prettier.format(JSON.stringify(systemFile), {
    parser: 'json'
  });

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
  await fs.copyFile('./dist/system.json', './package/system.json');

  log.success('Package created...');

  log.info('Pushing changes...');

  if (!dry) {
    execSync(`git tag -a v${systemFile.version} -m "Updated to v${systemFile.version}"`);

    execSync('git push origin main --tags');
  } else {
    log.warning('Dry mode activated, no tags will be pushed');
  }

  try {
    if (!dry) {
      execSync(
        `gh release create v${systemFile.version} ./package/* --verify-tag --generate-notes --draft`
      );
    } else {
      log.warning('Dry mode activated, no release will be created');
    }
  } catch (error) {
    readlineSync.question(
      chalk.blue(
        'Create the release now using the link: ' +
          `https://github.com/AnimaBeyondDevelop/AnimaBeyondFoundry/releases/new?title=v${systemFile.version}&tag=v${systemFile.version}` +
          '\nPress any key to continue...'
      )
    );

    readlineSync.question(
      chalk.blue(
        'Upload the contents of directory ./package (${systemFile.id}.zip and system.json) ' +
          'and press any key when finished...'
      )
    );
  }

  log.info('Cleaning files...');

  rimraf.sync('package');
  rimraf.sync('dist');

  log.success('Done!');
})();
