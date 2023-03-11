/* eslint-disable import/no-extraneous-dependencies,no-console,@typescript-eslint/no-var-requires */

const chalk = require('chalk');
const fs = require('fs-extra');

const config = fs.readFileSync('dist/animabf.name.js', 'utf8');
const name = process.argv[2];

try {
  fs.writeFileSync('dist/animabf.name.js', config.replace('$$$animabf$$$', name, 'g'));
} catch (e) {
  console.error(chalk.red(e.stack));
}
