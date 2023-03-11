const fs = require('fs-extra');
const chalk = require('chalk');

module.exports = {
  getFile: path => {
    if (fs.existsSync(path)) {
      return fs.readJSONSync(path);
    }

    console.log(chalk.red(`File ${path} does not exist`));
    return process.exit(1);
  }
};
