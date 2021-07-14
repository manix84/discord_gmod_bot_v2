import Database from "../Database";
import mysql from "mysql";

describe("Database", () => {

  beforeEach(() => {
    mysql.createConnection = jest.fn()
      .mockImplementationOnce(() => ({
        connect: jest.fn(),
        query: jest.fn()
          .mockImplementation((_query, callback) => {
            const error: Error | null = new Error("MySQL Error");
            const results: string[] = [];
            const fields = ["some", "fields"];
            callback(error, results, fields);
          }),
        end: jest.fn()
      }))
      .mockImplementation(() => ({
        connect: jest.fn(),
        query: jest.fn()
          .mockImplementation((_query, callback) => {
            const error: Error | null = null;
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

  test("registerServer", async () => {
    const dBase = new Database();
    expect(dBase.registerServer).toBeDefined();
    try {
      await dBase.registerServer(12345567890, "abcdefgHIJKLMN1234567");
    } catch (err) {
      expect(err).toEqual(Error("MySQL Error"));
    }
    await dBase.registerServer(12345567890, "abcdefgHIJKLMN1234567");
    await dBase.registerServer(12345567890, "abcdefgHIJKLMN1234567", true);
    expect(mysql.createConnection).toHaveBeenCalledTimes(3);
  });

  test("getServerID", async () => {
    console.log = jest.fn();
    const dBase = new Database();
    expect(dBase.getServerID).toBeDefined();
    try {
      await dBase.getServerID("abcdefgHIJKLMN1234567");
    } catch (err) {
      expect(err).toEqual(Error("MySQL Error"));
    }
    await dBase.getServerID("abcdefgHIJKLMN1234567");
    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
  });

  test("getUserID", async () => {
    console.log = jest.fn();
    const dBase = new Database();
    expect(dBase.getUserID).toBeDefined();
    try {
      await dBase.getUserID("12345678901234567890");
    } catch (err) {
      expect(err).toEqual(Error("MySQL Error"));
    }
    await dBase.getUserID("12345678901234567890");
    expect(mysql.createConnection).toHaveBeenCalledTimes(2);
  });

});
