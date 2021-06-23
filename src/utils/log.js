require('dotenv-flow').config({
  silent: true
});

const chalk = require('chalk');

const DEBUG = Boolean(process.env.DEBUG === 'true');

const log = (...msgs) => {
  if (!DEBUG) return;
  console.log(...msgs);
};

const success = (...msgs) => {
  if (!DEBUG) return;
  console.log(chalk.green(...msgs));
};

const warn = (...msgs) => {
  if (!DEBUG) return;
  console.warn(chalk.yellow(...msgs));
};

const info = (...msgs) => {
  if (!DEBUG) return;
  console.info(chalk.blue(...msgs));
};

const fail = (...msgs) => {
  if (!DEBUG) return;
  console.info(chalk.red(...msgs));
};

const br = () => {
  if (!DEBUG) return;
  console.log();
};

const error = (...msgs) => {
  console.error(chalk.red(...msgs));
};

module.exports = {
  log,
  br,
  newLine: br,
  success,
  fail,
  failure: fail,
  info,
  warn,
  warning: warn,
  error
};
