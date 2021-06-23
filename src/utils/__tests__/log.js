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
    const consoleSpy = jest.spyOn(console, 'log');
    log('test');
    expect(consoleSpy).toHaveBeenCalledWith('test');
  });

  test('br', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    br('test');
    expect(consoleSpy).toHaveBeenCalledWith();
  });

  test('newLine', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    newLine('test');
    expect(consoleSpy).toHaveBeenCalledWith();
  });

  test('success', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    success('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.green('test'));
  });

  test('fail', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    fail('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.red('test'));
  });

  test('failure', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    failure('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.red('test'));
  });

  test('info', () => {
    const consoleSpy = jest.spyOn(console, 'info');
    info('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.blue('test'));
  });

  test('warn', () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    warn('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.yellow('test'));
  });

  test('warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    warning('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.yellow('test'));
  });

  test('error', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    error('test');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.red('test'));
  });
});
