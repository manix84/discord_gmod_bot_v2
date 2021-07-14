import dotenv from "dotenv-flow";
import mysql from "mysql";

dotenv.config({
  silent: true
});

type DatabaseOptions = {
  databaseURL: string;
};

class Database {
  options: DatabaseOptions;

  constructor(options?: DatabaseOptions) {
    this.options = Object.assign({
      databaseURL: process.env.MYSQL_DATABASE_URL
    }, options);
  }

  private _connection = () => {
    const connection = mysql.createConnection(this.options.databaseURL);
    connection.connect();
    return connection;
  };

  private _runQuery = (query: string) =>
    new Promise((resolve, reject) => {
      const connection = this._connection();
      connection.query(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
      connection.end();
    })

  async registerServer(serverID: number, authToken: string, overwrite = false) {
    return await this._runQuery(
      `${overwrite ? "REPLACE" : "INSERT"} INTO servers (
        server_id,
        auth_token
      ) VALUES (
        ${mysql.escape(serverID)},
        ${mysql.escape(authToken)}
      );`
    );
  }

  async getServerID(authToken: string) {
    return await this._runQuery(
      `SELECT auth_token
      FROM servers
      WHERE auth_token = ${mysql.escape(authToken)};`
    );
  }
}

export default Database;
