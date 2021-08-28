import DiscordOauth2 from "discord-oauth2";
import { nanoid } from "nanoid";
import express from "express";
import cors from "cors";
import dotenv from "dotenv-flow";
import { DiscordMiddleware, init as initDiscord } from "./middleware/Discord";
import authenticate from "./utils/authentication";
import Database from "./middleware/Database";
import { error } from "./utils/log";
import { generateErrorResponse, generateSuccessResponse } from "./utils/responseBody";

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

// GET /servers/<uid>/channels -> 200 | 404 | 5XX
app.get("/servers/:serverID/channels", (request, response) => {
  const { serverID } = request.params;
  response
    .status(200)
    .json(generateSuccessResponse(request, {
      action: "list available voice channels",
      serverID
    }));
});

// GET /servers/<uid>/channels -> 200 | 404 | 5XX
app.get("/servers/:serverID/channels/:channelID", (request, response) => {
  const { serverID, channelID } = request.params;
  response
    .status(200)
    .json(generateSuccessResponse(request, {
      action: "confirm voice channel existance",
      serverID,
      channelID
    }));
});

// GET /servers/<uid>/users 200 | 403 | 404
app.get("/servers/:serverID/channels/:channelID/users", (request, response) => {
  const { serverID, channelID } = request.params;
  response
    .status(200)
    .json(generateSuccessResponse(request, {
      action: "list active voice users",
      serverID,
      channelID
    }));
});

// GET /servers/<uid>/users/<uid> 200 | 403 | 404
app.get("/servers/:serverID/channels/:channelID/users/:userID", (request, response) => {
  const { serverID, channelID, userID } = request.params;
  response
    .status(200)
    .json(generateSuccessResponse(request, {
      action: "confirm user existance",
      serverID,
      channelID,
      userID
    }));
});

// POST /servers/<uid>/users/<uid>/link 200 | 403 | 404
app.post("/servers/:serverID/channels/:channelID/users/:steamUserID/link", async (request, response) => {
  const { steamUserID } = request.params;
  const { linkToken } = request.body;
  console.log({ body: request.body });
  if (!linkToken) {
    response
      .status(406)
      .json(generateErrorResponse(request, {
        code: "MISSING_TOKEN",
        message: "Link Token Missing"
      }));
  } else {
    await dbase.registerSteamUser(steamUserID, linkToken)
      .then((res) => {
        if (res.error) {
          error(JSON.stringify(res.error));
          response
            .status(400)
            .json(generateErrorResponse(request, res.error));
        } else {
          response
            .status(200)
            .json(generateSuccessResponse(request, res));
        }
      })
      .catch((err) => {
        error(JSON.stringify(err));
        response
          .status(400)
          .json(generateErrorResponse(request, err));
      });
  }
});

// POST /servers/<uid>/users/<uid>/<action> 200 | 403 | 404
app.post("/servers/:serverID/channels/:channelID/users/:steamUserID/:action", async (request, response) => {
  const { serverID, channelID, steamUserID, action } = request.params;
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
    const discordServer = new DiscordMiddleware(serverID, channelID);
    switch (vettedAction) {
      case "mute":
        discordServer.mutePlayer(discordUserID, reason)
          .then((res) => {
            response
              .status(200)
              .json(generateSuccessResponse(request, res));
          }).catch((err) => {
            response
              .status(400)
              .json(generateErrorResponse(request, err));
          });
        break;
      case "unmute":
        discordServer.unmutePlayer(discordUserID, reason)
          .then((res) => {
            response
              .status(200)
              .json(generateSuccessResponse(request, res));
          }).catch((err) => {
            response
              .status(400)
              .json(generateErrorResponse(request, err));
          });
        break;
      case "deafen":
        discordServer.deafenPlayer(discordUserID, reason)
          .then((res) => {
            response
              .status(200)
              .json(generateSuccessResponse(request, res));
          }).catch((err) => {
            response
              .status(400)
              .json(generateErrorResponse(request, err));
          });
        break;
      case "undeafen":
        discordServer.undeafenPlayer(discordUserID, reason)
          .then((res) => {
            response
              .status(200)
              .json(generateSuccessResponse(request, res));
          }).catch((err) => {
            response
              .status(400)
              .json(generateErrorResponse(request, err));
          });
        break;
    }
  } else {
    response
      .status(403)
      .send(generateErrorResponse(request, {
        code: "INVALID_AUTH_TOKEN",
        message: "Invalid Auth Token"
      }));
  }
});

// // POST /servers/<uid>/users/<uid>/link 200 | 403 | 404
// app.post("/servers/:serverID/channels/:channelID/:action", async (request, response) => {
//   const { serverID, channelID, action } = request.params;
//   const { authorization } = request.headers;
//   const { reason } = request.body;
//   const validActions = ["mute", "unmute", "deafen", "undeafen"];
//   const vettedAction = validActions.includes(action) && action;
//   const isAuthenticated = await authenticate(authorization, serverID);
//   if (!vettedAction) {
//     response
//       .status(404)
//       .send();
//   } else if (isAuthenticated) {
//     const discordServer = new DiscordMiddleware(serverID, channelID);
//     switch (vettedAction) {
//       case "unmute":
//         discordServer.unmuteAllPlayer(reason)
//           .then((res) => {
//             response
//               .status(200)
//               .json(generateSuccessResponse(request, res));
//           }).catch((err) => {
//             response
//               .status(400)
//               .json(generateErrorResponse(request, err));
//           });
//         break;
//       case "undeafen":
//         discordServer.undeafenAllPlayer(reason)
//           .then((res) => {
//             response
//               .status(200)
//               .json(generateSuccessResponse(request, res));
//           }).catch((err) => {
//             response
//               .status(400)
//               .json(generateErrorResponse(request, err));
//           });
//         break;
//     }
//   } else {
//     response
//       .status(403)
//       .send();
//   }
// });

app.get("/invite", (_request, response) => {
  const oauth = new DiscordOauth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: `https://${process.env.HOST}/oauth_callback`
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
  <head>
    <title>Invite Discord Muter Bot</title>
    <link href="/styles/invite.css" rel="stylesheet" type="text/css" />
  </head>
  <body>
    <div class="inviteContainer">
      <div class="inviteBox">
        <div class="titleContainer">
          <div class="discordMuterIcon"></div>
          <h1>Discord Muter</h1>
        </div>
        <hr />
        <a href="${url}" class="inviteButton">Invite Bot</a>
        <p>You need to invite the Discord Muter<br />bot into your server for it to work.</p>
      </div>
    </div>
  </body>
  <!--
${url.replace(/([&?])([a-z0-9-_.~!*'();:@+$,/?#[\]]+)=/gi, "\n$1 <strong>$2</strong> = ")}
  -->
</html>`);
});
app.get("/oauth_callback", (request, response) => {
  // const { code, state, guild_id, permissions } = request.query;
  response
    .status(200)
    .send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Discord Muter Bot Connected!</title>
    <link href="/styles/invite.css" rel="stylesheet" type="text/css" />
    <link href="/styles/animated-svg.css" rel="stylesheet" type="text/css" />
  </head>
  <body>
    <div class="inviteContainer">
      <div class="inviteBox">
        <div class="titleContainer">
          <div class="discordMuterIcon"></div>
          <h1>Discord Muter</h1>
        </div>
        <hr />
        <div class="svg-box">
          <svg class="circular green-stroke">
            <circle class="path" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
          </svg>
          <svg class="checkmark green-stroke">
            <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
              <path class="checkmark__check" fill="none" d="M616.306,283.025L634.087,300.805L673.361,261.53"/>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </body>
</html>`);
});

app.get("/", (_request, response) => {
  response
    .status(203)
    .send();
});

export default app;
