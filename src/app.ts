import DiscordOauth2 from "discord-oauth2";
import { nanoid } from "nanoid";
import express from "express";
import cors from "cors";
import dotenv from "dotenv-flow";
import { DiscordMiddleware, init as initDiscord } from "./middleware/Discord";
import authenticate from "./utils/authentication";
import Database from "./middleware/Database";
import { error } from "./utils/log";
import { ErrorObj, generateErrorResponse, generateSuccessResponse } from "./utils/responseBody";

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
    .json(generateSuccessResponse(request, {
      action: "confirm server existance",
      serverID
    }));
});
// GET /servers/<uid>/users 200 | 403 | 404
app.get("/servers/:serverID/users", (request, response) => {
  const { serverID } = request.params;
  response
    .status(200)
    .json(generateSuccessResponse(request, {
      action: "list active voice users",
      serverID
    }));
});
// GET /servers/<uid>/users/<uid> 200 | 403 | 404
app.get("/servers/:serverID/users/:userID", (request, response) => {
  const { serverID, userID } = request.params;
  response
    .status(200)
    .json(generateSuccessResponse(request, {
      action: "confirm user existance",
      serverID,
      userID
    }));
});

// POST /servers/<uid>/users/<uid>/<action> 200 | 403 | 404
app.post("/servers/:serverID/users/:steamUserID/:action", async (request, response) => {
  const { serverID, steamUserID, action } = request.params;
  const { authorization } = request.headers;
  const { reason } = request.body;
  const validActions = ["mute", "unmute", "deafen", "undeafen"];
  const vettedAction = validActions.includes(action) && action;
  const discordUserID = await dbase.getUserID(steamUserID).catch(error);
  const isAuthenticated = await authenticate(authorization, serverID);
  if (!vettedAction || !discordUserID) {
    response
      .status(404)
      .send();
  } else if (isAuthenticated) {
    const discordServer = new DiscordMiddleware(serverID);
    switch (vettedAction) {
      case "mute":
        discordServer.mutePlayer(discordUserID, reason);
        break;
      case "unmute":
        discordServer.unmutePlayer(discordUserID, reason);
        break;
      case "deafen":
        discordServer.deafenPlayer(discordUserID, reason);
        break;
      case "undeafen":
        discordServer.undeafenPlayer(discordUserID, reason);
        break;
    }
    response
      .status(200)
      .json(generateSuccessResponse({
        action,
        reason
      }));
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
