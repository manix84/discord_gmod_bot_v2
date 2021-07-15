import dotenv from "dotenv-flow";
import mysql, { escape } from "mysql";

dotenv.config({
  silent: true
});

type DatabaseOptions = {
  databaseURL: string;
};
type QueryResponseRow = {
  [key: string]: string
}

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

  async registerServer(serverID: string, authToken: string, overwrite = false) {
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

  async getServerID(authToken: string): Promise<string> {
    return await this._runQuery(
      `SELECT server_id
      FROM servers
      WHERE auth_token = ${mysql.escape(authToken)};`
    )
      .then((result: QueryResponseRow[]) => result[0])
      .then((result: QueryResponseRow) => result.server_id);
  }

  async getUserID(steamUserID: string): Promise<string> {
    return await this._runQuery(
      `SELECT discord_user_id
      FROM users
      WHERE steam_user_id = ${escape(steamUserID)};`
    )
      .then((result: QueryResponseRow[]) => result[0])
      .then((result: QueryResponseRow) => result.discord_user_id);
  }

}

export default Database;
