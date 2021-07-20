import dotenv from "dotenv-flow";
import chalk from "chalk";

dotenv.config({
  silent: true
});

let DEBUG = Boolean(process.env.DEBUG === "true");

const setDebugState = (state: boolean): void => {
  DEBUG = Boolean(state);
};

export const log = (...msgs: any): boolean | void =>
  DEBUG && console.log(...msgs);

export const success = (...msgs: any): boolean | void =>
  DEBUG && console.log(chalk.green(...msgs));

export const warn = (...msgs: any): boolean | void =>
  DEBUG && console.warn(chalk.yellow(...msgs));

export const info = (...msgs: any): boolean | void =>
  DEBUG && console.info(chalk.blue(...msgs));

export const fail = (...msgs: any): boolean | void =>
  DEBUG && console.log(chalk.red(...msgs));

export const br = (): boolean | void =>
  DEBUG && console.log();

export const error = (...msgs: any): void =>
  console.error(chalk.red(...msgs));

export default setDebugState;
