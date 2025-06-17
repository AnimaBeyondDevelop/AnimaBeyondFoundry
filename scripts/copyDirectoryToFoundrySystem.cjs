/* eslint-disable import/no-extraneous-dependencies,no-console,@typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');

const directory = process.argv[2] ?? 'abf';
let destPath;

try {
  console.log(chalk.yellow('Trying to use fvtt to get dataPath...'));
  dataPath = execSync('fvtt configure get dataPath', { encoding: 'utf8' }).trim();
  if (!dataPath || dataPath === 'undefined') {
    msg = 'Error: fvtt not configured!';
    console.log(chalk.yellow(msg));
    throw new Error(msg);
  }
  destPath = `${dataPath}/Data/systems`;
} catch (e) {
  console.log(chalk.yellow('Falling back to foundryconfig.json'));
  destPath = fs.readJSONSync('foundryconfig.json').destPath;
}

try {
  fs.rmSync(`${destPath}/${directory}`, { recursive: true, force: true });
} catch {
  // ignore
}

try {
  execSync(`cp -r $(pwd)/dist ${destPath}/${directory}`);
  console.log(chalk.green(`Directory ${directory} copied into ${destPath}\n\n`));
} catch (e) {
  console.error(chalk.red(e.stack));
}
