# API:

> All endpoints will return a 429 if ratelimits are exceeded. Ratelimits are yet to be determined.

### GET /
  - 204
  - Can e.g. be used to check if the host is reachable and functioning
  
### GET /servers/
  - 200 (authed)
  - 204 (unauthed)
  - 403 (authed, incorrect token)
  - List of all server IDs, only with a debugging token

### GET UNAUTHED /servers/ID
  - 200: Server ID exists
  - 404: Server ID doesn't exist

### GET AUTHED /servers/ID
  - 200: Miscellainous server statistics (e.g. amount of connected users, map, ... - Could be used for e.g. an embed or similar, just brainstorming here)
  - 403: Invalid Token
  - 404: Server ID doesn't exist

### Requests with authentication
All of the following will return a:
 - 400 if the request is malformed.
 - 401 if the authentication header is missing or malformed.
 - 403 if the authentication details are invalid, or the requested data is forbidden.
 - 404 if the server ID is unknown.
 - 405 if the client attempts to write to a read-only resource
Conflict with errors 403/404:
> An unknown server can never have valid credentials. A 404 therefor must always cause a 403. I recommend for the 404 to take precedence, to allow for this distinction to be made.
> If the 403 takes precedence, it would be impossible to encounter a 404, requiring a second request to the /servers/ID endpoint to distinguish the errors.

### GET /servers/{Server_ID}/
  - 200: A Discord guild object

### GET /servers/{Server_ID}/channels/
  - 200: A list of Discord voicechannel objects

### GET /servers/{Server_ID}/channels/{Channel_ID}/
 - 200: A Discord voicechannel object

### GET /servers/{Server_ID}/channels/{Channel_ID}/users/
  - 200: List of (partial) user objects that are currently connected to the given Discord voicechannel

### GET /servers/{Server_ID}/channels/{Channel_ID}/users?steam_id={Steam_User_ID}
### GET /servers/{Server_ID}/channels/{Channel_ID}/users?discord_id={Discord_User_ID}
  - 200: A user object

### POST /servers/{Server_ID}/channels/{Channel_ID}/users?steam_id={Steam_User_ID}
### POST /servers/{Server_ID}/channels/{Channel_ID}/users?discord_id={Discord_User_ID}
With payload:
```json
{
    "steam_id":"steam_id",
    "discord_id":"discord_id",
    "steam_name":"steam_name",
    "discord_name":"discord_name#1234",
    "identifier_token":"token"
}
```
> Any of the fields are optional, as long as there is enough information to uniquely identify the user. Usually, this would be the steam_id plus the discord_name, or identifier_token.

> The request may also contain more information such as muting info, however it is not guaranteed to apply that information properly. This POST endpoint is only meant for creating the User, after the account has been synced a PUT request is advised.

 - 200: A user object
 - 400: If the provided information is insufficient to create a complete, and uniquely identifiable user object. The server will act lenient, and attempt to extract information from e.g. the URL parameters, but will reject incomplete requests

### PUT /servers/{Server_ID}/channels/{Channel_ID}/users?steam_id={Steam_User_ID}
### PUT /servers/{Server_ID}/channels/{Channel_ID}/users?discord_id={Discord_User_ID}
With payload:
```json
{
    "action":["mute", "deafen"],
    "reason":"Reason for the change in state",
    "duration":[0, 2000]
}
```

> Duration in ms until the given action is reverted. The server keeps track of all actions independently, so if there is a mute for 5000ms and a deafen for 3000ms, they will not interfere. Newer requests will override older requests, so if there is an existing mute for 5000ms, and a new one with no timeout gets made, the old timer is discarded and the mute will not be removed until a new request is sent.
A duration of 0 indicates no timeout.

> The server will attempt to parse requests as lenient as possible, so if only a single action is taken, there is no need to send an array of actions.

Returns:
 - 200: The updated user object

### PUT /servers/{Server_ID}/channels/{Channel_ID}/all
With payload:
```json
{
    "action":["mute", "deafen"],
    "reason":"Reason for the change in state",
    "duration":[0, 2000]
}
```

> See previous endpoint. This will apply to all users in the given channel.

Returns:
 - 200: A list of updated user objects
