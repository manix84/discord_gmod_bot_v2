require('dotenv-flow').config({
  silent: true
});

const DiscordOauth2 = require('discord-oauth2');
const { nanoid } = require('nanoid');
const express = require('express');
const cors = require('cors');

require('./utils/debug');
// require('./discord').init();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET /servers/<uid> -> 200 | 404 | 5XX
app.get('/servers/:serverID', (request, response) => {
  const { serverID } = request.params;
  response
    .status(200)
    .json({
      action: 'confirm server existance',
      serverID
    });
});
// GET /servers/<uid>/users 200 | 403 | 404
app.get('/servers/:serverID/users', (request, response) => {
  const { serverID } = request.params;
  response
    .status(200)
    .json({
      action: 'list users',
      serverID
    });
});
// GET /servers/<uid>/users/<uid> 200 | 403 | 404
app.get('/servers/:serverID/users/:userID', (request, response) => {
  const { serverID, userID } = request.params;
  response
    .status(200)
    .json({
      action: 'confirm user existance',
      serverID,
      userID
    });
});
// POST /servers/<uid>/users/<uid>/mute 200 | 403 | 404
app.post('/servers/:serverID/users/:userID/:command', (request, response) => {
  const { serverID, userID, command } = request.params;
  const validCommands = ['mute', 'unmute', 'deafen', 'undeafen'];
  const vettedCommand = validCommands.includes(command) && command;
  response
    .status(vettedCommand ? 200 : 404)
    .json({
      serverID,
      userID,
      vettedCommand
    });
});

app.get('/', (request, response) => {
  response
    .status(200)
    .send('Hello World!');
});

app.get('/invite', (request, response) => {
  const oauth = new DiscordOauth2({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: `https://${process.env.HOST}/callback`
  });

  const url = oauth.generateAuthUrl({
    scope: ['identify', 'guilds', 'bot'],
    state: nanoid(),
    permissions: 29444160
  });

  response
    .status(200)
    .send(`
<!doctype>
<html>
  <body>
    <a href="${url}">Invite Bot</a>
    <pre>${url.replace(/([&?])([a-z0-9-_.~!*'();:@+$,/?#[\]]+)=/gi, '\n$1 <strong>$2</strong> = ')}</pre>
  </body>
</html>
  `);
});

module.exports = app;
