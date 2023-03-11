// This script is used to generate the template.json file from the Actor.ts file

/* eslint-disable import/no-extraneous-dependencies,no-console,@typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const prettier = require('prettier');
const chalk = require('chalk');
const fs = require('fs-extra');

const content = fs.readFileSync('src/module/types/Actor.ts', 'utf8');

try {
  let typedCharacteristics = content.substr(content.indexOf('{'), content.lastIndexOf('}'));

  typedCharacteristics = typedCharacteristics.replace(/;}/g, '}');
  typedCharacteristics = typedCharacteristics.replace(/;/g, ',');
  typedCharacteristics = typedCharacteristics.replace(/number/g, '0');
  typedCharacteristics = typedCharacteristics.replace(/string/g, "''");
  typedCharacteristics = typedCharacteristics.replace(/boolean/g, 'false');
  typedCharacteristics = typedCharacteristics.substr(0, typedCharacteristics.lastIndexOf(','));
  typedCharacteristics = prettier.format(typedCharacteristics, { parser: 'json' });

  const templatePath = 'src/template.json';

  const template = fs.readJSONSync(templatePath);

  template.Actor.character = JSON.parse(typedCharacteristics);

  fs.writeJsonSync(templatePath, template);

  execSync('prettier src/template.json --write');
} catch (e) {
  console.error(chalk.red(e.stack));
}
