const chalk = require('chalk');

module.exports = {
  throwError: message => {
    console.log(chalk.red(message));
    return process.exit(1);
  }
};
