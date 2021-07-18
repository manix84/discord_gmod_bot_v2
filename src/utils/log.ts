import dotenv from "dotenv-flow";
import chalk from "chalk";

dotenv.config({
  silent: true
});

let DEBUG = Boolean(process.env.DEBUG === "true");

const setDebugState = (state: boolean): void => {
  DEBUG = Boolean(state);
};

const cleanMessages = (...msgs: any) =>
  msgs.map((val: any) =>
    (typeof val[0] === "object") ? JSON.stringify(val[0]) : val[0]
  );

export const log = (...msgs: any): boolean | void =>
  DEBUG && console.log(...cleanMessages(msgs));

export const success = (...msgs: any): boolean | void =>
  DEBUG && console.log(chalk.green(...cleanMessages(msgs)));

export const warn = (...msgs: any): boolean | void =>
  DEBUG && console.warn(chalk.yellow(...cleanMessages(msgs)));

export const info = (...msgs: any): boolean | void =>
  DEBUG && console.info(chalk.blue(...cleanMessages(msgs)));

export const fail = (...msgs: any): boolean | void =>
  DEBUG && console.log(chalk.red(...cleanMessages(msgs)));

export const br = (): boolean | void =>
  DEBUG && console.log();

export const error = (...msgs: any): void =>
  console.error(chalk.red(...cleanMessages(msgs)));

export default setDebugState;
