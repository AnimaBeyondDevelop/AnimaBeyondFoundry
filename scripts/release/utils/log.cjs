const chalk = require('chalk');

module.exports = {
  log: {
    info: message => console.log(chalk.blue(message)),
    success: message => console.log(chalk.green(chalk.bold(message))),
    error: message => console.log(chalk.red(message)),
    warning: message => console.log(chalk.yellow(message))
  }
};
