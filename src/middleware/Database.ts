import dotenv from "dotenv-flow";
import mysql from "mysql";
import { error } from "../utils/log";

dotenv.config({
  silent: true
});

type DatabaseOptions = {
  writeOnSet?: boolean;
  refreshDelay?: number;
};

type QueryResponse = {
  success: boolean;
  reason?: string;
  results: any;
}

interface QueryCallback {
  (response: QueryResponse): void
}

interface RegisterServerCallback {
  (
    success: boolean,
    reason?: string
  ): void
}

class Database {
  options: DatabaseOptions;

  constructor(options?: DatabaseOptions) {
    this.options = Object.assign({}, options);
  }

  _connect(): mysql.Connection {
    const DatabaseURL = process.env.MYSQL_DATABASE_URL || "";

    const connection = mysql.createConnection(DatabaseURL);
    connection.connect();
    return connection;
  }

  _runQuery(query: string, callback?: QueryCallback) {
    const connection = this._connect();
    connection.query({
      sql: query,
      timeout: 2500, // 2.5s
    }, (err, results) => {
      if (err) {
        error("err", err);
      }
      if (callback) {
        callback({
          success: !err,
          reason: err && err.code || undefined,
          results
        });
      }
    });
    connection.end();
  }

  registerServer(serverID: number, authToken: string, callback: RegisterServerCallback) {
    this._runQuery(
      `INSERT INTO servers (
        server_id,
        auth_token
      ) VALUES (
        ${mysql.escape(serverID)},
        ${mysql.escape(authToken)}
      );`,
      (response) => callback(response.success, response.reason)
    );
  }

  reRegisterServer(serverID: number, authToken: string, callback: RegisterServerCallback) {
    this._runQuery(
      `REPLACE INTO servers (
        server_id,
        auth_token
      ) VALUES (
        ${mysql.escape(serverID)},
        ${mysql.escape(authToken)}
      );`,
      (response) => callback(response.success, response.reason)
    );
  }
}

export default Database;
