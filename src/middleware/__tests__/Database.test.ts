import Database from "../Database";
import mysql from "mysql";

describe("Database", () => {

  beforeEach(() => {
    mysql.createConnection = jest.fn()
      .mockImplementationOnce(() => ({
        connect: jest.fn(),
        query: jest.fn()
          .mockImplementation((_query, callback) => {
            const error = new Error("mysql error");
            const results: string[] = [];
            const fields = ["some", "fields"];
            callback(error, results, fields);
          }),
        end: jest.fn()
      }))
      .mockImplementationOnce(() => ({
        connect: jest.fn(),
        query: jest.fn()
          .mockImplementation((_query, callback) => {
            const error = null;
            const results: string[] = [];
            const fields = ["some", "fields"];
            callback(error, results, fields);
          }),
        end: jest.fn()
      }));
  });

  test("constructor", () => {
    const dBase = new Database();
    expect(dBase).toBeInstanceOf(Database);
  });

  test("_connect", () => {
    jest.mock("../Database");
    const dBase = new Database();
    dBase._connect();
    expect(dBase._connect).toBeDefined();
    expect(mysql.createConnection).toHaveBeenCalledTimes(1);
  });

  test("_runQuery", () => {
    console.error = jest.fn();
    const dBase = new Database();
    expect(dBase._runQuery).toBeDefined();

    dBase._runQuery("SELECT * FROM 'servers';", () => console.log);
    dBase._runQuery("SELECT * FROM 'servers';");
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
  });

  test("registerServer", () => {
    const dBase = new Database();
    expect(dBase.registerServer).toBeDefined();
    dBase.registerServer(12345567890, "abcdefgHIJKLMN1234567", () => "");
    dBase.registerServer(12345567890, "abcdefgHIJKLMN1234567", () => "", true);
    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
  });

  test("getServerID", () => {
    console.log = jest.fn();
    const dBase = new Database();
    expect(dBase.getServerID).toBeDefined();
    dBase.getServerID("abcdefgHIJKLMN1234567");
    expect(mysql.createConnection).toHaveBeenCalledTimes(1);
  });

});
