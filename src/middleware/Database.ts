import dotenv from "dotenv-flow";
import mysql, { escape } from "mysql";

dotenv.config({
  silent: true
});

type DatabaseOptions = {
  databaseURL: string;
};
type QuerySuccessResponse = {
  "fieldCount": number;
  "affectedRows": number;
  "insertId": number;
  "serverStatus": number;
  "warningCount": number;
  "message": string,
  "protocol41": boolean,
  "changedRows": number
}
type QuerySelectResponseRow = {
  [key: string]: string
}
type QueryResponse = QuerySelectResponseRow[] | QuerySuccessResponse;
type DiscordUserID = string;
type SteamUserID = string;
type LinkToken = string;

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

  private _runQuery = (query: string): Promise<QueryResponse> =>
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
      .then((result: QuerySelectResponseRow[]) => result[0])
      .then((result: QuerySelectResponseRow) => result.server_id);
  }

  async getUserID(steamUserID: string): Promise<string> {
    return await this._runQuery(
      `SELECT discord_user_id
      FROM users
      WHERE steam_user_id = ${escape(steamUserID)};`
    )
      .then((result: QuerySelectResponseRow[]) => result[0])
      .then((result: QuerySelectResponseRow) => result.discord_user_id);
  }
  }

  async registerDiscordUser(
    discordUserID: DiscordUserID,
    linkToken: LinkToken
  ) {
    return await this._runQuery(`
      INSERT INTO users (
        discord_user_id,
        link_token
      ) VALUES (
        ${escape(discordUserID)},
        ${escape(linkToken)}
      );
    `);
  }

  async registerSteamUser(
    steamUserID: SteamUserID,
    linkToken: LinkToken
  ) {
    return await this._runQuery(`
      UPDATE users
      SET steam_user_id = ${escape(steamUserID)}
      WHERE link_token = ${escape(linkToken)};
    `)
      .then((result: QuerySuccessResponse) => {
        if (!result.affectedRows) {
          return { error: {
            code: "UNKNOWN_TOKEN",
            message: "Your Link Token can't be found."
          }};
        } else if (!result.changedRows) {
          return { error: {
            code: "ALREADY_LINKED",
            message: "You appear to already be linked."
          }};
        } else {
          return { success: true };
        }
      });
  }
}

export default Database;
