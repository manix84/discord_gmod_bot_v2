import DiscordOauth2 from "discord-oauth2";
import { nanoid } from "nanoid";
import express from "express";
import cors from "cors";
import dotenv from "dotenv-flow";
import { DiscordMiddleware, init as initDiscord } from "./middleware/Discord";
import authenticate from "./utils/authentication";
import Database from "./middleware/Database";
import { error } from "./utils/log";

const dbase = new Database();

dotenv.config({
  silent: true
});

require("./utils/debug");

initDiscord();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET /servers/<uid> -> 200 | 404 | 5XX
app.get("/servers/:serverID", (request, response) => {
  const { serverID } = request.params;
  response
    .status(200)
    .json({
      action: "confirm server existance",
      serverID
    });
});
// GET /servers/<uid>/users 200 | 403 | 404
app.get("/servers/:serverID/users", (request, response) => {
  const { serverID } = request.params;
  response
    .status(200)
    .json({
      action: "list users",
      serverID
    });
});
// GET /servers/<uid>/users/<uid> 200 | 403 | 404
app.get("/servers/:serverID/users/:userID", (request, response) => {
  const { serverID, userID } = request.params;
  response
    .status(200)
    .json({
      action: "confirm user existance",
      serverID,
      userID
    });
});
// POST /servers/<uid>/users/<uid>/mute 200 | 403 | 404
app.post("/servers/:serverID/users/:steamUserID/:command", async (request, response) => {
  const { serverID, steamUserID, command } = request.params;
  const { authorization } = request.headers;
  const validCommands = ["mute", "unmute", "deafen", "undeafen"];
  const vettedCommand = validCommands.includes(command) && command;
  const discordUserID = await dbase.getUserID(steamUserID).catch(error);
  if (!vettedCommand || !discordUserID) {
    response
      .status(404)
      .send();
  } else if (await authenticate(authorization, serverID)) {
    const discordServer = new DiscordMiddleware(serverID);
    switch (vettedCommand) {
      case "mute":
        discordServer.mutePlayer(discordUserID);
        break;
      case "unmute":
        discordServer.unmutePlayer(discordUserID);
        break;
      case "deafen":
        discordServer.deafenPlayer(discordUserID);
        break;
      case "undeafen":
        discordServer.undeafenPlayer(discordUserID);
        break;
    }
    response
      .status(200)
      .json({
        serverID,
        steamUserID,
        discordUserID,
        vettedCommand
      });
  } else {
    response
      .status(403)
      .send();
  }
});

app.get("/", (_request, response) => {
  response
    .status(203)
    .send();
});

app.get("/invite", (_request, response) => {
  const oauth = new DiscordOauth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: `https://${process.env.HOST}/callback`
  });

  const url: string = oauth.generateAuthUrl({
    scope: ["identify", "guilds", "bot"],
    state: nanoid(),
    permissions: 29444160
  });

  response
    .status(200)
    .send(`
<!DOCTYPE html>
<html>
  <body>
    <a href="${url}">Invite Bot</a>
    <pre>${url.replace(/([&?])([a-z0-9-_.~!*'();:@+$,/?#[\]]+)=/gi, "\n$1 <strong>$2</strong> = ")}</pre>
  </body>
</html>
  `);
});

export default app;
