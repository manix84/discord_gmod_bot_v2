const chalk = require('chalk');
const {
  log,
  br,
  newLine,
  success,
  fail,
  failure,
  info,
  warn,
  warning,
  error
} = require('../log');

console.log = jest.fn();

describe('Logs.js', () => {
  test('log', () => {
    console.log = jest.fn();
    log('test');
    expect(console.log).toHaveBeenCalledWith('test');
  });

  test('br', () => {
    console.log = jest.fn();
    br('test');
    expect(console.log).toHaveBeenCalledWith();
  });

  test('newLine', () => {
    console.log = jest.fn();
    newLine('test');
    expect(console.log).toHaveBeenCalledWith();
  });

  test('success', () => {
    console.log = jest.fn();
    success('test');
    expect(console.log).toHaveBeenCalledWith(chalk.green('test'));
  });

  test('fail', () => {
    console.log = jest.fn();
    fail('test');
    expect(console.log).toHaveBeenCalledWith(chalk.red('test'));
  });

  test('failure', () => {
    console.log = jest.fn();
    failure('test');
    expect(console.log).toHaveBeenCalledWith(chalk.red('test'));
  });

  test('info', () => {
    console.info = jest.fn();
    info('test');
    expect(console.info).toHaveBeenCalledWith(chalk.blue('test'));
  });

  test('warn', () => {
    console.warn = jest.fn();
    warn('test');
    expect(console.warn).toHaveBeenCalledWith(chalk.yellow('test'));
  });

  test('warning', () => {
    console.warn = jest.fn();
    warning('test');
    expect(console.warn).toHaveBeenCalledWith(chalk.yellow('test'));
  });

  test('error', () => {
    console.error = jest.fn();
    error('test');
    expect(console.error).toHaveBeenCalledWith(chalk.red('test'));
  });
});
