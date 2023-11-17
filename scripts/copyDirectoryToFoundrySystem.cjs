/* eslint-disable import/no-extraneous-dependencies,no-console,@typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');

const config = fs.readJSONSync('foundryconfig.json');
const directory = process.argv[2];

try {
  fs.rmSync(`${config.destPath}/${directory}`, { recursive: true, force: true });
} catch {
  // ignore
}

try {
  execSync(`cp -r $(pwd)/dist ${config.destPath}/${directory}`);
  console.log(chalk.green(`Directory ${directory} copied into ${config.destPath}\n\n`));
} catch (e) {
  console.error(chalk.red(e.stack));
}
